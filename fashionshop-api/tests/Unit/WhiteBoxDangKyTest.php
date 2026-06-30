<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class WhiteBoxDangKyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tạo Request
     */
    private function makeRequest($data = [])
    {
        return new Request($data);
    }

    /**
     * WB01
     * Bao phủ nhánh:
     * register() validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb01_register_validation_fail()
    {
        $request = $this->makeRequest([
            'fullname' => '',
            'email' => 'abc',
            'phone' => '123',
            'gender' => 'ABC',
            'password' => '123',
            'password_confirmation' => '456'
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new AuthController())->register($request);
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * register() đăng ký thành công
     *
     * Kết quả mong đợi:
     * HTTP 201
     */
    public function test_wb02_register_success()
    {
        $request = $this->makeRequest([
            'fullname' => 'Nguyen Van A',
            'email' => 'vana@gmail.com',
            'phone' => '0912345678',
            'gender' => 'Nam',
            'password' => '123456',
            'password_confirmation' => '123456'
        ]);

        $response = (new AuthController())->register($request);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('users', [
            'email' => 'vana@gmail.com',
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'gender' => 'Nam'
        ]);

        $user = User::where('email', 'vana@gmail.com')->first();

        $this->assertTrue(
            Hash::check('123456', $user->password)
        );
    }
}