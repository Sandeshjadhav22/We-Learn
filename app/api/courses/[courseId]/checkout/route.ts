import Stripe from "stripe"
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorised", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
    });

    if(!course){
        return new NextResponse("Course not found",{status:404})
    }
    
    const purchase = await db.purchase.findUnique({
        where: {
          customerId_courseId: { customerId: user.id, courseId: course.id },
        },
      });

      if (purchase) {
        return new NextResponse("Course Already Purchased", { status: 400 });
      }   

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(course.price! * 100),
          },
        }
      ]

      let stripeCustomer = await db.stripeCustomer.findUnique({
        where: { customerId: user.id },
        select: { stripeCustomerId: true },
      });

      if (!stripeCustomer) {
        const customer = await stripe.customers.create({
          email: user.emailAddresses[0].emailAddress,
        });
  
        stripeCustomer = await db.stripeCustomer.create({
          data: {
            customerId: user.id,
            stripeCustomerId: customer.id,
          },
        });
      }
   

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer.stripeCustomerId,
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${course.id}/overview?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${course.id}/overview?canceled=true`,
        metadata: {
          courseId: course.id,
          customerId: user.id,
        }
      });
  
      return NextResponse.json({ url: session.url })

  } catch (error) {
    console.log("[courseId_Checkout_POST]", error);
    return new NextResponse("Internal server error");
  }
};
