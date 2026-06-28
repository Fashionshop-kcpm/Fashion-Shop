<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Whitebox Feature Test: ContactController
 *
 * Coverage: store()
 * Kiểm tra mọi nhánh điều kiện trong ContactController:
 *   - Validation: fullname required, email valid format, message required
 *   - Success path: Contact::create() → 201
 */
class ContactTest extends TestCase
{
    use RefreshDatabase;

    // =====================================================================
    // STORE TESTS
    // =====================================================================

    /**
     * TC-CONTACT-01: Gửi liên hệ thành công
     * Branch: Validation pass → Contact::create() → 201
     */
    public function test_submit_contact_success(): void
    {
        $response = $this->postJson('/api/v1/contacts', [
            'fullname' => 'Nguyen Van A',
            'email'    => 'contact@example.com',
            'message'  => 'Tôi muốn hỏi về sản phẩm của quý shop.',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Email liên hệ đã được gửi thành công')
                 ->assertJsonPath('token', null);

        $this->assertDatabaseHas('contacts', [
            'fullname' => 'Nguyen Van A',
            'email'    => 'contact@example.com',
        ]);
    }

    /**
     * TC-CONTACT-02: Thiếu fullname → 422
     * Branch: 'fullname' => 'required' triggered
     */
    public function test_submit_contact_missing_fullname(): void
    {
        $response = $this->postJson('/api/v1/contacts', [
            'email'   => 'contact@example.com',
            'message' => 'Nội dung liên hệ',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['fullname']);
    }

    /**
     * TC-CONTACT-03: Email không đúng format → 422
     * Branch: 'email' => 'email' rule triggered
     */
    public function test_submit_contact_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/contacts', [
            'fullname' => 'Nguyen Van A',
            'email'    => 'not-an-email',
            'message'  => 'Nội dung liên hệ',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-CONTACT-04: Thiếu message → 422
     * Branch: 'message' => 'required' triggered
     */
    public function test_submit_contact_missing_message(): void
    {
        $response = $this->postJson('/api/v1/contacts', [
            'fullname' => 'Nguyen Van A',
            'email'    => 'contact@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }

    /**
     * TC-CONTACT-05: Thiếu tất cả fields → 422 với tất cả errors
     * Branch: Tất cả 'required' rules triggered cùng lúc
     */
    public function test_submit_contact_missing_all_fields(): void
    {
        $response = $this->postJson('/api/v1/contacts', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['fullname', 'email', 'message']);
    }

    /**
     * TC-CONTACT-06: Email rỗng (empty string) → 422
     * Branch: 'email' => 'required' triggered với empty value
     */
    public function test_submit_contact_empty_email(): void
    {
        $response = $this->postJson('/api/v1/contacts', [
            'fullname' => 'Nguyen Van A',
            'email'    => '',
            'message'  => 'Nội dung liên hệ',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-CONTACT-07: ContactController là public route (không cần auth) → thành công
     * Branch: Không có middleware auth:sanctum → request được xử lý
     */
    public function test_contact_does_not_require_authentication(): void
    {
        // Gọi mà không có Authorization header
        $response = $this->postJson('/api/v1/contacts', [
            'fullname' => 'Anonymous User',
            'email'    => 'anon@example.com',
            'message'  => 'Tin nhắn ẩn danh',
        ]);

        // Phải thành công mà không cần token
        $response->assertStatus(201);
    }
}
