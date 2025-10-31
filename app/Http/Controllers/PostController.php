<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use App\Models\Like;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth; // Import the Auth facade


class PostController extends Controller
{
    public function index(Request $request)
    {
        // รับค่า category_id และ sort จาก query string
        $category_id = $request->input('category_id');
        $sort = $request->input('sort', 'desc'); // ค่าเริ่มต้นคือ 'desc' (ใหม่ล่าสุด)

        // ตรวจสอบว่าเป็นการเรียก API หรือไม่
        if ($request->expectsJson()) {
            // ถ้าเป็นการเรียกแบบ API ให้คืนข้อมูลในรูปแบบ JSON
            $posts = Post::with(['user', 'category', 'comments', 'likes', 'attachments'])
                ->when($category_id, function ($query) use ($category_id) {
                    return $query->where('category_id', $category_id); // กรองตาม category_id
                })
                ->orderBy('id', $sort) // การจัดลำดับตาม id
                ->get();

            return response()->json($posts);
        }

        // ถ้าเป็นการเรียกจาก Inertia ให้ส่งไปยัง React component
        $posts = Post::with(['user', 'category', 'comments', 'likes', 'attachments'])
            ->when($category_id, function ($query) use ($category_id) {
                return $query->where('category_id', $category_id); // กรองตาม category_id
            })
            ->orderBy('id', $sort) // การจัดลำดับตาม id
            ->get();

        $categories = Category::all();
        $selectedCategory = $category_id ? Category::find($category_id) : null;

        return Inertia::render('Sontana/Posts/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
            'currentSort' => $sort, // ส่งค่าลำดับปัจจุบันไปยัง React component
        ]);
    }


    public function create()
    {
        $categories = Category::all(); // ดึงหมวดหมู่จากฐานข้อมูล

        return Inertia::render('Sontana/Posts/create', [
            'categories' => $categories
        ]);
    }


    public function store(Request $request)
    {

        Log::info($request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // ✅ ตรวจสอบไฟล์รูปภาพ
        ]);

        // ✅ ตรวจสอบไฟล์รูปภาพก่อนบันทึก
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('postimagenew', 'public');
        }

        DB::transaction(function () use ($validated) { // Use Auth::id() for clarity and consistency
            $postData = [
                'user_id' => Auth::id(), // Use Auth::id() to get the authenticated user's ID
                'title' => $validated['title'],
                'content' => $validated['content'],
                'category_id' => $validated['category_id'],
                'image' => $validated['image'] ?? null,
                'status' => 'active',
            ];

            Log::info('Creating new post:', $postData);

            Post::create($postData); // Use the Eloquent model for creation
        });

        return redirect('/sontana/posts')->with('success', 'Post created!');
    }


    public function show($id)
    {
        // ดึงข้อมูลโพสต์พร้อมความสัมพันธ์
        $post = Post::with(['user', 'category', 'comments.user', 'likes', 'attachments'])
            ->findOrFail($id);
        // ✅ ดึงหมวดหมู่ทั้งหมด
        $categories = Category::all();

        return Inertia::render('Sontana/Posts/Postid', [
            'post' => $post,
            'categories' => $categories, // ✅ ต้องส่ง categories ไป

        ]);
    }

    public function edit($id)
    {
        $post = Post::findOrFail($id);
        $categories = Category::all(); // ดึงหมวดหมู่จากฐานข้อมูล

        return Inertia::render('Sontana/Posts/EditPost', [
            'post' => $post,
            'categories' => $categories
        ]);
    }
    public function update(Request $request, $id)
    {
        // Validate request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            // หาข้อมูลโพสต์ที่ต้องการอัปเดต
            $post = Post::findOrFail($id);

            // ถ้ามีการอัปโหลดภาพใหม่
            if ($request->hasFile('image')) {
                // ลบรูปภาพเก่าหากมี
                if ($post->image) {
                    Storage::delete('public/' . $post->image); // ลบไฟล์เก่าจาก storage
                }

                // อัปโหลดรูปภาพใหม่และเก็บในตัวแปร image
                $post->image = $request->file('image')->store('postimages', 'public');
            }

            // อัปเดตข้อมูลในฐานข้อมูล
            $post->update([
                'title' => $validated['title'],
                'content' => $validated['content'],
                'category_id' => $validated['category_id'],
                'image' => $post->image, // ใช้ค่า image ที่อัปโหลดใหม่
            ]);
        } catch (\Exception $e) {
            Log::error('Post update failed: ' . $e->getMessage());
            return redirect('/sontana/posts')->with('error', 'Post update failed');
        }

        return redirect('/sontana/posts')->with('success', 'Post updated!');
    }

    public function destroy($id)
    {

        DB::transaction(function () use ($id) {
            $post = Post::with(['comments', 'reports', 'likes'])->findOrFail($id);

            // ลบไลก์ที่เกี่ยวข้อง
            Like::where('post_id', $id)->delete();

            // ลบ reports ที่เกี่ยวข้อง
            Report::where('post_id', $id)->delete();

            // ลบคอมเมนต์ที่เกี่ยวข้อง
            $post->comments()->delete();

            // ลบโพสต์
            $post->delete();
        });

        return redirect()->route('post.index')->with('success', 'Post deleted successfully!');
    }

    public function incrementView($id)
    {
        $post = Post::findOrFail($id);
        $post->increment('views'); // เพิ่มค่า views +1

        return redirect()->route('post.show', ['id' => $id]);
    }
}
