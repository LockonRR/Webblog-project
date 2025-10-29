<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. เลือก Category ที่มีอยู่จริงในฐานข้อมูล
        $category = Category::inRandomOrder()->first() ?? Category::factory()->create();

        // 2. สร้างชื่อหัวข้อ (Title) แบบสุ่มธรรมดา
        $title = $this->faker->sentence(mt_rand(5, 8));

        // 3. สร้างเนื้อหา (Content) แบบย่อหน้าธรรมดา ไม่มี HTML tags (ยกเว้น \n)
        $content = $this->faker->paragraphs(mt_rand(5, 15), true);


        return [
            // อ้างอิงถึง User ที่มีอยู่ หรือสร้างใหม่หากยังไม่มี
            'user_id' => User::factory(),

            // อ้างอิงถึง Category ที่สุ่มมา
            'category_id' => $category->id,

            'title' => $title,
            'content' => $content,

            'image' => null,

            'views' => $this->faker->numberBetween(0, 5000),

            'status' => $this->faker->randomElement(['active', 'locked', 'deleted']),

            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
