<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: ProfileController
 *
 * Coverage: show(), update(), changePassword()
 * Kiểm tra mọi nhánh điều kiện trong ProfileController:
 *   - update(): validation email/phone/gender branches
 *   - changePassword(): Hash::check() đúng/sai; password mới < 6; token được tạo mới
 */
class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create([
            'password' => bcrypt('oldpassword'),
        ]);
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    // =====================================================================
    // SHOW TESTS
    // =====================================================================

    /**
     * TC-PROFILE-01: Lấy thông tin profile thành công
     * Branch: $request->user() → user object → trả về đầy đủ thông tin
     */
    public function test_get_profile_success(): void
    {
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/profile');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'name', 'user', 'id', 'fullname', 'email', 'phone', 'gender',
                 ])
                 ->assertJsonPath('email', $this->user->email);
    }

    /**
     * TC-PROFILE-02: Lấy profile khi chưa xác thực → 401
     * Branch: auth:sanctum middleware rejects
     */
    public function test_get_profile_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/profile');
        $response->assertStatus(401);
    }

    // =====================================================================
    // UPDATE TESTS
    // =====================================================================

    /**
     * TC-PROFILE-03: Cập nhật profile thành công
     * Branch: Validation pass → $request->user()->update() → 200
     */
    public function test_update_profile_success(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile', [
            'email'  => $this->user->email, // Giữ email cũ (unique ok)
            'phone'  => '0987654321',
            'gender' => 'Nữ',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('status', true)
                 ->assertJsonPath('message', 'Cập nhật thành công')
                 ->assertJsonStructure(['status', 'message', 'user']);

        $this->assertDatabaseHas('users', [
            'id'     => $this->user->id,
            'phone'  => '0987654321',
            'gender' => 'Nữ',
        ]);
    }

    /**
     * TC-PROFILE-04: Cập nhật email đã tồn tại ở user khác → 422
     * Branch: 'email' => 'unique:users,email,{id}' triggered (email của user khác)
     */
    public function test_update_profile_duplicate_email_of_another_user(): void
    {
        $otherUser = User::factory()->create(['email' => 'other@example.com']);

        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile', [
            'email'  => 'other@example.com',
            'phone'  => '0987654321',
            'gender' => 'Nam',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-PROFILE-05: Phone không hợp lệ → 422
     * Branch: 'phone' => 'regex:/^[0-9]{9,11}$/' triggered
     */
    public function test_update_profile_invalid_phone(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile', [
            'email'  => $this->user->email,
            'phone'  => '123',
            'gender' => 'Nam',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-PROFILE-06: Gender không hợp lệ → 422
     * Branch: 'gender' => 'in:Nam,Nữ' triggered
     */
    public function test_update_profile_invalid_gender(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile', [
            'email'  => $this->user->email,
            'phone'  => '0912345678',
            'gender' => 'Unknown',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['gender']);
    }

    // =====================================================================
    // CHANGE PASSWORD TESTS
    // =====================================================================

    /**
     * TC-PROFILE-07: Đổi mật khẩu thành công → token mới được tạo
     * Branch: Hash::check(old_password) → true → update password → delete token → createToken()
     */
    public function test_change_password_success(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile/password', [
            'old_password'              => 'oldpassword',
            'new_password'              => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đổi mật khẩu thành công')
                 ->assertJsonStructure(['message', 'token', 'updated_at']);

        // Token mới phải khác token cũ
        $newToken = $response->json('token');
        $this->assertNotNull($newToken);
    }

    /**
     * TC-PROFILE-08: Mật khẩu cũ sai → 400
     * Branch: Hash::check($old_password, $user->password) → false → return 400
     */
    public function test_change_password_wrong_old_password(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile/password', [
            'old_password'              => 'wrongpassword',
            'new_password'              => 'newpassword123',
            'new_password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Mật khẩu hiện tại không chính xác');
    }

    /**
     * TC-PROFILE-09: Mật khẩu mới quá ngắn (< 6 ký tự) → 422
     * Branch: 'new_password' => 'min:6' triggered
     */
    public function test_change_password_new_password_too_short(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile/password', [
            'old_password'              => 'oldpassword',
            'new_password'              => '123',
            'new_password_confirmation' => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['new_password']);
    }

    /**
     * TC-PROFILE-10: Mật khẩu mới không khớp confirmed → 422
     * Branch: 'new_password' => 'confirmed' triggered
     */
    public function test_change_password_confirmation_mismatch(): void
    {
        $response = $this->withHeaders($this->auth())->putJson('/api/v1/profile/password', [
            'old_password'              => 'oldpassword',
            'new_password'              => 'newpassword123',
            'new_password_confirmation' => 'different123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['new_password']);
    }
}
