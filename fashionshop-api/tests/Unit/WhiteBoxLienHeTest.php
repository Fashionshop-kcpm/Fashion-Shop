<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Contact;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class WhiteBoxLienHeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * WB01
     * Bao phủ nhánh:
     * Validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb01_store_validation_fail()
    {
        $request = new Request([
            'fullname' => '',
            'email' => 'abc',
            'message' => ''
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new ContactController())->store($request);
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * Gửi liên hệ thành công
     *
     * Kết quả mong đợi:
     * HTTP 201
     */
    public function test_wb02_store_success()
    {
        $request = new Request([
            'fullname' => 'Nguyen Van A',
            'email' => 'test@gmail.com',
            'message' => 'Xin chào Shop'
        ]);

        $response = (new ContactController())->store($request);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('contacts', [
            'fullname' => 'Nguyen Van A',
            'email' => 'test@gmail.com',
            'message' => 'Xin chào Shop'
        ]);
    }
}