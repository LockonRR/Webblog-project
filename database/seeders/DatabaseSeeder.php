<?php

namespace Database\Seeders;
use Database\Factories\CategoryFactory;
use App\Models\Category;
use Database\Factories\PostsFactory;
use App\Models\Post;
use App\Models\User; // ใช้โมเดล User เพื่อเข้าถึงและสร้างข้อมูลผู้ใช้
use Illuminate\Database\Seeder; // ใช้สำหรับสร้าง class Seeder ใน Laravel

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * เมธอดนี้ใช้สำหรับทำการ seed ข้อมูลเริ่มต้นลงในฐานข้อมูล.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            CategorySeeder::class,
            CommentsSeeder::class,
            LikesSeeder::class,
            PostsSeeder::class,
            ReportsSeeder::class,
            UserSeeder::class,
            // เพิ่ม Seeder อื่น ๆ ที่ต้องการเรียกใช้
        ]);
        // สร้างผู้ใช้หนึ่งรายด้วยข้อมูลที่กำหนดเอง
        User::factory()->create([
            'name' => 'Test User', // กำหนดชื่อผู้ใช้เป็น "Test User"
            'email' => 'test@example.com', // กำหนดอีเมลของผู้ใช้
        ]);
    }
}
