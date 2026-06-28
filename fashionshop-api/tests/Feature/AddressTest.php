<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: UserAddressController
 *
 * Coverage: index(), store(), destroy(), setDefault()
 * Kiểm tra mọi nhánh điều kiện trong UserAddressController:
 *   - store(): is_default = true → reset tất cả trước; is_default = false → tạo thường
 *   - destroy(): address tồn tại / không tồn tại
 *   - setDefault(): address tồn tại / không tồn tại → reset all → set default mới
 */
class AddressTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create();
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }

    // =====================================================================
    // INDEX TESTS
    // =====================================================================

    /**
     * TC-ADDR-01: Lấy danh sách địa chỉ khi chưa có → total = 0
     * Branch: UserAddress::where(user_id)->orderBy('is_default', 'desc')->get() → empty
     */
    public function test_get_addresses_empty(): void
    {
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/addresses');

        $response->assertStatus(200)
                 ->assertJsonPath('total', 0)
                 ->assertJsonPath('data', []);
    }

    /**
     * TC-ADDR-02: Lấy danh sách địa chỉ, sắp xếp is_default desc
     * Branch: orderBy('is_default', 'desc') → địa chỉ mặc định lên đầu
     */
    public function test_get_addresses_sorted_by_default(): void
    {
        UserAddress::factory()->create([
            'user_id'    => $this->user->id,
            'is_default' => 0,
        ]);
        UserAddress::factory()->create([
            'user_id'    => $this->user->id,
            'is_default' => 1,
        ]);

        $response = $this->withHeaders($this->auth())->getJson('/api/v1/addresses');

        $response->assertStatus(200)
                 ->assertJsonPath('total', 2);

        // Địa chỉ đầu tiên phải là is_default = 1
        $first = $response->json('data.0');
        $this->assertEquals(1, $first['is_default']);
    }

    // =====================================================================
    // STORE TESTS
    // =====================================================================

    /**
     * TC-ADDR-03: Thêm địa chỉ mới thành công (không phải default)
     * Branch: if($request->is_default) → false → skip reset → UserAddress::create()
     */
    public function test_add_address_success(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/addresses', [
            'fullname'        => 'Nguyen Van A',
            'phone'           => '0912345678',
            'address_details' => '123 Nguyen Hue, Q1, TP.HCM',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true)
                 ->assertJsonPath('message', 'Đã thêm địa chỉ')
                 ->assertJsonStructure(['success', 'message', 'address']);

        $this->assertDatabaseHas('user_addresses', [
            'user_id'  => $this->user->id,
            'fullname' => 'Nguyen Van A',
        ]);
    }

    /**
     * TC-ADDR-04: Thêm địa chỉ với is_default = true → reset all trước
     * Branch: if($request->is_default) → true → reset existing defaults
     */
    public function test_add_address_with_is_default_resets_others(): void
    {
        // Tạo địa chỉ hiện tại có is_default = 1
        $existing = UserAddress::factory()->create([
            'user_id'    => $this->user->id,
            'is_default' => 1,
        ]);

        $this->withHeaders($this->auth())->postJson('/api/v1/addresses', [
            'fullname'        => 'Nguyen Van B',
            'phone'           => '0987654321',
            'address_details' => '456 Le Loi, Q3',
            'is_default'      => true,
        ]);

        // Địa chỉ cũ phải được reset về 0
        $this->assertDatabaseHas('user_addresses', [
            'id'         => $existing->id,
            'is_default' => 0,
        ]);
    }

    /**
     * TC-ADDR-05: Phone không hợp lệ → 422
     * Branch: 'phone' => 'regex:/^[0-9]{9,11}$/' triggered
     */
    public function test_add_address_invalid_phone(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/addresses', [
            'fullname'        => 'Nguyen Van A',
            'phone'           => '123',
            'address_details' => '123 Nguyen Hue',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['phone']);
    }

    /**
     * TC-ADDR-06: Thiếu address_details → 422
     * Branch: 'address_details' => 'required' triggered
     */
    public function test_add_address_missing_address_details(): void
    {
        $response = $this->withHeaders($this->auth())->postJson('/api/v1/addresses', [
            'fullname' => 'Nguyen Van A',
            'phone'    => '0912345678',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['address_details']);
    }

    // =====================================================================
    // DESTROY TESTS
    // =====================================================================

    /**
     * TC-ADDR-07: Xóa địa chỉ thành công
     * Branch: UserAddress::where(id, user_id)->first() → found → delete() → 200
     */
    public function test_delete_address_success(): void
    {
        $address = UserAddress::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->withHeaders($this->auth())
                         ->deleteJson("/api/v1/addresses/{$address->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã xóa địa chỉ')
                 ->assertJsonStructure(['message', 'address']);

        $this->assertDatabaseMissing('user_addresses', ['id' => $address->id]);
    }

    /**
     * TC-ADDR-08: Xóa địa chỉ không tồn tại → 404
     * Branch: UserAddress::where(id, user_id)->first() → null → return 404
     */
    public function test_delete_nonexistent_address(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->deleteJson('/api/v1/addresses/99999');

        $response->assertStatus(404)
                 ->assertJsonPath('message', 'Không tìm thấy địa chỉ');
    }

    /**
     * TC-ADDR-09: Xóa địa chỉ của user khác → 404
     * Branch: where('user_id', $request->user()->id) → no match → null → 404
     */
    public function test_delete_address_belonging_to_another_user(): void
    {
        $otherUser = User::factory()->create();
        $address   = UserAddress::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->auth())
                         ->deleteJson("/api/v1/addresses/{$address->id}");

        $response->assertStatus(404);
    }

    // =====================================================================
    // SET DEFAULT TESTS
    // =====================================================================

    /**
     * TC-ADDR-10: Đặt địa chỉ mặc định thành công
     * Branch: Reset all → where(id, user_id)->first() → found → update(is_default=1) → 200
     */
    public function test_set_default_address_success(): void
    {
        $addr1 = UserAddress::factory()->create([
            'user_id'    => $this->user->id,
            'is_default' => 1,
        ]);
        $addr2 = UserAddress::factory()->create([
            'user_id'    => $this->user->id,
            'is_default' => 0,
        ]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/addresses/{$addr2->id}/default");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Đã đặt địa chỉ mặc định')
                 ->assertJsonPath('sync_all_addresses', true);

        // addr1 phải được reset về 0
        $this->assertDatabaseHas('user_addresses', [
            'id'         => $addr1->id,
            'is_default' => 0,
        ]);

        // addr2 phải được set thành 1
        $this->assertDatabaseHas('user_addresses', [
            'id'         => $addr2->id,
            'is_default' => 1,
        ]);
    }

    /**
     * TC-ADDR-11: Đặt địa chỉ không tồn tại làm mặc định → 404
     * Branch: where(id, user_id)->first() → null → return 404
     */
    public function test_set_default_nonexistent_address(): void
    {
        $response = $this->withHeaders($this->auth())
                         ->patchJson('/api/v1/addresses/99999/default');

        $response->assertStatus(404)
                 ->assertJsonPath('message', 'Không tìm thấy địa chỉ');
    }

    /**
     * TC-ADDR-12: Đặt địa chỉ của user khác làm mặc định → 404
     * Branch: where('user_id', user->id) filters → null → 404
     */
    public function test_set_default_address_belonging_to_another_user(): void
    {
        $otherUser = User::factory()->create();
        $address   = UserAddress::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders($this->auth())
                         ->patchJson("/api/v1/addresses/{$address->id}/default");

        $response->assertStatus(404);
    }
}
