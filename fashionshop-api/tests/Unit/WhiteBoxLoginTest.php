<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class WhiteBoxLoginTest extends TestCase
{
    use RefreshDatabase;

    private function makeRequest($data = [])
    {
        return new Request($data);
    }

    /**
     * WB01
     * Bao phủ nhánh: login() validate thất bại
     * Kết quả mong đợi: ValidationException
     */
    public function test_wb01_login_validation_fail()
    {
        $request = $this->makeRequest([
            'email' => '',
            'password' => ''
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new AuthController())->login($request);
    }

    /**
     * WB02
     * Bao phủ nhánh: Sai email hoặc mật khẩu
     * Kết quả mong đợi: HTTP 401
     */
    public function test_wb02_login_failed()
    {
        User::create([
            'fullname' => 'Nguyen Van A',
            'email' => 'test@gmail.com',
            'phone' => '0912345678',
            'gender' => 'Nam',
            'password' => Hash::make('123456')
        ]);

        $request = $this->makeRequest([
            'email' => 'test@gmail.com',
            'password' => '654321'
        ]);

        $response = (new AuthController())->login($request);

        $this->assertEquals(401, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh: Đăng nhập thành công
     * Kết quả mong đợi: HTTP 200
     */
    public function test_wb03_login_success()
    {
        User::create([
            'fullname' => 'Nguyen Van A',
            'email' => 'test@gmail.com',
            'phone' => '0912345678',
            'gender' => 'Nam',
            'password' => Hash::make('123456')
        ]);

        $request = $this->makeRequest([
            'email' => 'test@gmail.com',
            'password' => '123456'
        ]);

        $response = (new AuthController())->login($request);

        $this->assertEquals(200, $response->status());

        $json = json_decode($response->getContent(), true);

        $this->assertEquals(
            'Đăng nhập thành công',
            $json['message']
        );

        $this->assertArrayHasKey('token', $json);
    }

    /**
     * WB04
     * Bao phủ nhánh: logout() đăng xuất thành công
     * Kết quả mong đợi: HTTP 200
     */
    public function test_wb04_logout_success()
    {
        $user = User::create([
            'fullname' => 'Nguyen Van A',
            'email' => 'test@gmail.com',
            'phone' => '0912345678',
            'gender' => 'Nam',
            'password' => Hash::make('123456')
        ]);

        $tokenResult = $user->createToken('auth_token');
        $user->withAccessToken($tokenResult->accessToken);

        $request = new Request();
        $request->setUserResolver(fn () => $user);

        $response = (new AuthController())->logout($request);

        $this->assertEquals(200, $response->status());
    }
}
