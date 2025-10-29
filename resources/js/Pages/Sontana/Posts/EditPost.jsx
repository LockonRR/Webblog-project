import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import ThemeSwitcher from "@/Components/ThemeSwitcher";

export default function Edit({ post, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: post.title,
        content: post.content,
        category_id: post.category_id,
        image: null,
    });

    const [previewImage, setPreviewImage] = useState(
        post.image ? `/storage/${post.image}` : null
    );

    // เช็คการเปลี่ยนแปลงข้อมูล
    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
        console.log("Updated form data:", {
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    // เช็คการเลือกไฟล์
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData("image", file);

        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            console.log("File selected:", file);
        }
    };

    // ใช้ async/await แทน then() ในการส่งข้อมูล
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("category_id", data.category_id);

        if (data.image) {
            formData.append("image", data.image);
        } else {
            formData.append("image", null);
        }

        // เช็คข้อมูลก่อนส่ง
        console.log("Form data to be submitted:", formData);

        try {
            // ใช้ async/await แทน then()
            const response = await put(route("post.update", post.id), {
                data: formData,
                preserveScroll: true,
            });
            console.log("Post updated successfully:", response);
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <ThemeSwitcher />
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md">
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-6">
                    ✨ Edit Post
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={data.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-500 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Category
                        </label>
                        <select
                            name="category_id"
                            value={data.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                    className="text-black dark:text-white bg-white dark:bg-gray-800"
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Content
                        </label>
                        <textarea
                            name="content"
                            value={data.content}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-500 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        ></textarea>
                        {errors.content && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    <div>
                        {previewImage && (
                            <div className="mt-3">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Current Image:
                                </p>
                                <img
                                    src={previewImage}
                                    alt="Post Preview"
                                    className="w-full h-full object-cover mt-2 rounded-lg"
                                />
                            </div>
                        )}
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition transform focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {processing ? "Processing..." : "Update Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}
