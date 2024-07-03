"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios"

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ComboBox } from "../custom/ComboBox";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is requred and minimum 2 char",
  }),
  categoryId: z.string().min(1, {
    message: "Category is requried",
  }),
  subCategoryId: z.string().min(1, {
    message: "SubCategory is requried",
  }),
});

interface CreateCourseFormProps {
  categories: {
    label: string;
    value: string;
    subCategories: { label: string; value: string }[];
  }[];
}

const CreateCourseForm = ({ categories }: CreateCourseFormProps) => {
    const router = useRouter()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      subCategoryId: "",
    },
  });

  // 2. Define a submit handler.
  const  onSubmit = async(values: z.infer<typeof formSchema>) => {
   
    try {
        const response = await axios.post('/api/courses',values)
        router.push(`/instructor/courses/${response.data.id}/basic`)
        toast.success("New Course created")
    } catch (error) {
        console.log("Failed to create new course",error);
        toast.error("Something went wrong")
    }
  }
  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Let give some basic for your course</h1>
      <p className="text-sm mt-3">
        It is okay if you cannot think of a good title or correct category now .
        You can change them later
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Web Devlopment for begineer" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <ComboBox options={categories} {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subCategoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Subcategory</FormLabel>
                <FormControl>
                  <ComboBox
                    options={categories.find(
                      (category) =>
                        category.value ===
                          form.watch("categoryId")
                    )?.subCategories || []}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;
