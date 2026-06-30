<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class WhiteBoxDoiMatKhauTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tạo Request có user đăng nhập
     */
    private function makeRequest($user, $data = [])
    {
        $request = new Request($data);
        $request->setUserResolver(fn () => $user);

        return $request;
    }

    /**
     * WB01
     * Bao phủ nhánh:
     * Validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb01_change_password_validation_fail()
    {
        $user = User::factory()->create([
            'password' => Hash::make('123456')
        ]);

        $request = $this->makeRequest($user, [
            'old_password' => '',
            'new_password' => '123',
            'new_password_confirmation' => '456'
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new ProfileController())->changePassword($request);
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * Mật khẩu cũ không chính xác
     *
     * Kết quả mong đợi:
     * HTTP 400
     */
    public function test_wb02_change_password_wrong_old_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('123456')
        ]);

        $request = $this->makeRequest($user, [
            'old_password' => '654321',
            'new_password' => 'abcdef',
            'new_password_confirmation' => 'abcdef'
        ]);

        $response = (new ProfileController())->changePassword($request);

        $this->assertEquals(400, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh:
     * Đổi mật khẩu thành công
     *
     * Kết quả mong đợi:
     * HTTP 200
     */
    public function test_wb03_change_password_success()
    {
        $user = User::factory()->create([
            'password' => Hash::make('123456')
        ]);

        $tokenResult = $user->createToken('auth_token');
        $user->withAccessToken($tokenResult->accessToken);

        $request = $this->makeRequest($user, [
            'old_password' => '123456',
            'new_password' => 'abcdef',
            'new_password_confirmation' => 'abcdef'
        ]);

        $response = (new ProfileController())->changePassword($request);

        $this->assertEquals(200, $response->status());

        $this->assertTrue(
            Hash::check('abcdef', $user->fresh()->password)
        );
    }
}