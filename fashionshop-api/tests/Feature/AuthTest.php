<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: AuthController
 *
 * Coverage: register(), login(), logout()
 * Kiểm tra mọi nhánh điều kiện (branch coverage) trong AuthController:
 *   - Validation rules: fullname, email, phone, gender, password
 *   - Logic đăng nhập: user tồn tại / không tồn tại, password đúng / sai
 *   - Token generation sau đăng ký và đăng nhập
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // =====================================================================
    // REGISTER TESTS
    // =====================================================================

    /**
     * TC-AUTH-01: Đăng ký thành công với đầy đủ thông tin hợp lệ
     * Branch: Validation pass → User::create() → createToken() → 201
     */
    public function test_register_success(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '0912345678',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'fullname', 'email', 'phone', 'gender'],
                     'token',
                 ])
                 ->assertJsonPath('message', 'Đăng ký thành công');

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    /**
     * TC-AUTH-02: Thiếu fullname → validation fail 422
     * Branch: 'fullname' => 'required' rule triggered
     */
    public function test_register_missing_fullname(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'email'                 => 'test@example.com',
            'phone'                 => '0912345678',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['fullname']);
    }

    /**
     * TC-AUTH-03: Email không đúng format → 422
     * Branch: 'email' => 'email' rule triggered
     */
    public function test_register_invalid_email_format(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'not-an-email',
            'phone'                 => '0912345678',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-AUTH-04: Email đã tồn tại → 422 (unique constraint)
     * Branch: 'email' => 'unique:users,email' rule triggered
     */
    public function test_register_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van B',
            'email'                 => 'existing@example.com',
            'phone'                 => '0912345679',
            'gender'                => 'Nữ',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-AUTH-05: Phone quá ngắn (< 9 số) → 422
     * Branch: 'phone' => 'regex:/^[0-9]{9,11}$/' triggered (too short)
     */
    public function test_register_phone_too_short(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '08765',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-AUTH-06: Phone quá dài (> 11 số) → 422
     * Branch: 'phone' => 'regex:/^[0-9]{9,11}$/' triggered (too long)
     */
    public function test_register_phone_too_long(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '012345678901',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-AUTH-07: Phone chứa ký tự không phải số → 422
     * Branch: 'phone' => 'regex' triggered (non-numeric)
     */
    public function test_register_phone_contains_letters(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => 'abc123def',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-AUTH-08: Gender không hợp lệ → 422
     * Branch: 'gender' => 'in:Nam,Nữ' triggered
     */
    public function test_register_invalid_gender(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '0912345678',
            'gender'                => 'Male',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['gender']);
    }

    /**
     * TC-AUTH-09: Password không khớp confirmed → 422
     * Branch: 'password' => 'confirmed' rule triggered
     */
    public function test_register_password_mismatch(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '0912345678',
            'gender'                => 'Nam',
            'password'              => 'password123',
            'password_confirmation' => 'different_password',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    /**
     * TC-AUTH-10: Password quá ngắn (< 6 ký tự) → 422
     * Branch: 'password' => 'min:6' rule triggered
     */
    public function test_register_password_too_short(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'fullname'              => 'Nguyen Van A',
            'email'                 => 'test@example.com',
            'phone'                 => '0912345678',
            'gender'                => 'Nam',
            'password'              => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    // =====================================================================
    // LOGIN TESTS
    // =====================================================================

    /**
     * TC-AUTH-11: Đăng nhập thành công
     * Branch: User exists AND Hash::check() → true → createToken() → 200
     */
    public function test_login_success(): void
    {
        $user = User::factory()->create([
            'email'    => 'login@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email'    => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => ['id', 'fullname', 'email', 'phone', 'gender'],
                     'token',
                 ])
                 ->assertJsonPath('message', 'Đăng nhập thành công');
    }

    /**
     * TC-AUTH-12: Đăng nhập với mật khẩu sai → 401
     * Branch: User exists BUT Hash::check() → false → 401
     */
    public function test_login_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'login@example.com',
            'password' => bcrypt('correct_password'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email'    => 'login@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
                 ->assertJsonPath('message', 'Email hoặc mật khẩu không chính xác');
    }

    /**
     * TC-AUTH-13: Đăng nhập với email không tồn tại → 401
     * Branch: User::where('email')->first() → null → 401
     */
    public function test_login_email_not_found(): void
    {
        $response = $this->postJson('/api/v1/login', [
            'email'    => 'notexist@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
                 ->assertJsonPath('message', 'Email hoặc mật khẩu không chính xác');
    }

    /**
     * TC-AUTH-14: Thiếu email khi đăng nhập → 422
     * Branch: 'email' => 'required' validation triggered
     */
    public function test_login_missing_email(): void
    {
        $response = $this->postJson('/api/v1/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    // =====================================================================
    // LOGOUT TESTS
    // =====================================================================

    /**
     * TC-AUTH-15: Đăng xuất thành công với token hợp lệ
     * Branch: auth:sanctum middleware passes → currentAccessToken()->delete()
     */
    public function test_logout_success(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/v1/logout');

        $response->assertStatus(200)
                 ->assertJsonPath('status', true)
                 ->assertJsonPath('message', 'Đăng xuất thành công');
    }

    /**
     * TC-AUTH-16: Đăng xuất không có token → 401
     * Branch: auth:sanctum middleware rejects unauthenticated request
     */
    public function test_logout_unauthenticated(): void
    {
        $response = $this->postJson('/api/v1/logout');

        $response->assertStatus(401);
    }
}
