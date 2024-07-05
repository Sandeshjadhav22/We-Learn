import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import CreateSectionForm from "@/components/sections/CreateSectionForm";

const CourseCurriculumPage = async ({ params }: { params: { courseId: string }}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in")
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: userId,
    },
    include: {
      sections: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/instructor/courses")
  }

  return (
    <CreateSectionForm course={course} />
  );
}

export default CourseCurriculumPage;