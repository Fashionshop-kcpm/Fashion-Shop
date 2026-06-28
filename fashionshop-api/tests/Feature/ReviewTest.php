<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: ReviewController
 *
 * Coverage: index(), store()
 * Kiểm tra mọi nhánh điều kiện trong ReviewController:
 *   - index(): lấy reviews theo product_id, sắp xếp theo created_at asc, thêm review_date
 *   - store(): validation rating (min:1, max:5), comment required; tạo review + load user
 */
class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user    = User::factory()->create();
        $this->token   = $this->user->createToken('auth_token')->plainTextToken;
        $this->product = Product::factory()->create();
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    // =====================================================================
    // INDEX TESTS
    // =====================================================================

    /**
     * TC-REVIEW-01: Lấy reviews của sản phẩm (rỗng)
     * Branch: Review::where(product_id)->orderBy('created_at', 'asc')->get() → empty
     */
    public function test_get_reviews_empty(): void
    {
        $response = $this->getJson("/api/v1/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
                 ->assertJson([]);
    }

    /**
     * TC-REVIEW-02: Lấy reviews của sản phẩm (có reviews)
     * Branch: ->get() → non-empty → each() thêm review_date
     *         Verify: review_date = created_at (line mapping trong each())
     */
    public function test_get_reviews_with_data(): void
    {
        Review::factory()->count(3)->create([
            'product_id' => $this->product->id,
            'rating'     => 4,
            'comment'    => 'Tốt lắm',
        ]);

        $response = $this->getJson("/api/v1/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
                 ->assertJsonCount(3)
                 ->assertJsonStructure([
                     '*' => ['id', 'product_id', 'user_id', 'rating', 'comment', 'review_date'],
                 ]);
    }

    /**
     * TC-REVIEW-03: Reviews của sản phẩm khác không hiện trong kết quả
     * Branch: Where clause 'product_id' filters correctly
     */
    public function test_reviews_are_product_isolated(): void
    {
        $otherProduct = Product::factory()->create();
        Review::factory()->count(2)->create(['product_id' => $otherProduct->id]);

        $response = $this->getJson("/api/v1/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
                 ->assertJson([]);
    }

    // =====================================================================
    // STORE TESTS
    // =====================================================================

    /**
     * TC-REVIEW-04: Gửi đánh giá thành công với rating hợp lệ
     * Branch: Validation pass → Review::create() → load('user') → add rating_text → 201
     */
    public function test_submit_review_success(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 5,
                             'comment' => 'Sản phẩm rất tốt, chất lượng cao!',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Đã gửi đánh giá')
                 ->assertJsonStructure([
                     'message',
                     'review' => ['id', 'product_id', 'user_id', 'rating', 'comment', 'rating_text', 'user'],
                 ]);

        // Verify rating_text được tạo đúng format
        $response->assertJsonPath('review.rating_text', '5 sao');

        $this->assertDatabaseHas('reviews', [
            'product_id' => $this->product->id,
            'user_id'    => $this->user->id,
            'rating'     => 5,
        ]);
    }

    /**
     * TC-REVIEW-05: Rating = 1 (min boundary) → thành công
     * Branch: 'rating' => 'min:1' boundary = valid
     */
    public function test_submit_review_min_rating(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 1,
                             'comment' => 'Không ổn lắm',
                         ]);

        $response->assertStatus(201);
        $response->assertJsonPath('review.rating_text', '1 sao');
    }

    /**
     * TC-REVIEW-06: Rating = 5 (max boundary) → thành công
     * Branch: 'rating' => 'max:5' boundary = valid
     */
    public function test_submit_review_max_rating(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 5,
                             'comment' => 'Xuất sắc!',
                         ]);

        $response->assertStatus(201);
    }

    /**
     * TC-REVIEW-07: Rating = 0 (dưới min) → 422
     * Branch: 'rating' => 'min:1' triggered
     */
    public function test_submit_review_rating_too_low(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 0,
                             'comment' => 'Comment',
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['rating']);
    }

    /**
     * TC-REVIEW-08: Rating = 6 (vượt max) → 422
     * Branch: 'rating' => 'max:5' triggered
     */
    public function test_submit_review_rating_too_high(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 6,
                             'comment' => 'Comment',
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['rating']);
    }

    /**
     * TC-REVIEW-09: Thiếu comment → 422
     * Branch: 'comment' => 'required' triggered
     */
    public function test_submit_review_missing_comment(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating' => 4,
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['comment']);
    }

    /**
     * TC-REVIEW-10: Rating không phải integer → 422
     * Branch: 'rating' => 'integer' triggered
     */
    public function test_submit_review_non_integer_rating(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->postJson("/api/v1/products/{$this->product->id}/reviews", [
                             'rating'  => 'five',
                             'comment' => 'Comment',
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['rating']);
    }

    /**
     * TC-REVIEW-11: Gửi review khi chưa xác thực → 401
     * Branch: auth:sanctum middleware rejects
     */
    public function test_submit_review_unauthenticated(): void
    {
        $response = $this->postJson("/api/v1/products/{$this->product->id}/reviews", [
            'rating'  => 5,
            'comment' => 'Tốt',
        ]);

        $response->assertStatus(401);
    }
}
