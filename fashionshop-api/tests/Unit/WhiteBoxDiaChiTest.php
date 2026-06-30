<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UserAddressController;

class WhiteBoxDiaChiTest extends TestCase
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
     * index() có dữ liệu
     *
     * Kết quả mong đợi: 200
     */
    public function test_wb01_index_has_address()
    {
        $user = User::factory()->create();

        UserAddress::create([
            'user_id' => $user->id,
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address_details' => 'TP HCM',
            'is_default' => 1,
        ]);

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->index($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB02
     * Bao phủ nhánh:
     * index() không có dữ liệu
     *
     * Kết quả mong đợi: 200
     */
    public function test_wb02_index_empty()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->index($request);

        $this->assertEquals(200, $response->status());
    }

    /**
     * WB03
     * Bao phủ nhánh:
     * Validate thất bại
     *
     * Kết quả mong đợi:
     * ValidationException
     */
    public function test_wb03_store_validation_fail()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => '',
            'phone' => '123',
            'address_details' => ''
        ]);

        $this->expectException(
            \Illuminate\Validation\ValidationException::class
        );

        (new UserAddressController())->store($request);
    }

    /**
     * WB04
     * Bao phủ nhánh:
     * Có chọn địa chỉ mặc định
     *
     * Kết quả mong đợi: 201
     */
    public function test_wb04_store_default_success()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address_details' => 'TP HCM',
            'is_default' => 1
        ]);

        $response = (new UserAddressController())->store($request);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'fullname' => 'Nguyen Van A'
        ]);
    }

        /**
     * WB05
     * Bao phủ nhánh:
     * Không chọn địa chỉ mặc định
     *
     * Kết quả mong đợi: 201
     */
    public function test_wb05_store_normal_success()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user, [
            'fullname' => 'Tran Van B',
            'phone' => '0987654321',
            'address_details' => 'Ha Noi',
            'is_default' => 0
        ]);

        $response = (new UserAddressController())->store($request);

        $this->assertEquals(201, $response->status());

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $user->id,
            'fullname' => 'Tran Van B'
        ]);
    }

    /**
     * WB06
     * Bao phủ nhánh:
     * destroy() không tìm thấy địa chỉ
     *
     * Kết quả mong đợi: 404
     */
    public function test_wb06_destroy_not_found()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->destroy($request, 999);

        $this->assertEquals(404, $response->status());
    }

    /**
     * WB07
     * Bao phủ nhánh:
     * destroy() thành công
     *
     * Kết quả mong đợi: 200
     */
    public function test_wb07_destroy_success()
    {
        $user = User::factory()->create();

        $address = UserAddress::create([
            'user_id' => $user->id,
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address_details' => 'TP HCM',
            'is_default' => 0,
        ]);

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->destroy($request, $address->id);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseMissing('user_addresses', [
            'id' => $address->id
        ]);
    }

    /**
     * WB08
     * Bao phủ nhánh:
     * setDefault() không tìm thấy địa chỉ
     *
     * Kết quả mong đợi: 404
     */
    public function test_wb08_set_default_not_found()
    {
        $user = User::factory()->create();

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->setDefault($request, 999);

        $this->assertEquals(404, $response->status());
    }

    /**
     * WB09
     * Bao phủ nhánh:
     * setDefault() thành công
     *
     * Kết quả mong đợi: 200
     */
    public function test_wb09_set_default_success()
    {
        $user = User::factory()->create();

        $address = UserAddress::create([
            'user_id' => $user->id,
            'fullname' => 'Nguyen Van A',
            'phone' => '0912345678',
            'address_details' => 'TP HCM',
            'is_default' => 0,
        ]);

        $request = $this->makeRequest($user);

        $response = (new UserAddressController())->setDefault($request, $address->id);

        $this->assertEquals(200, $response->status());

        $this->assertDatabaseHas('user_addresses', [
            'id' => $address->id,
            'is_default' => 1
        ]);
    }
}



