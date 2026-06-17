<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookLog extends Model
{
    protected $fillable = [
        'event',
        'payload',
        'url',
        'status_code',
        'response_body',
        'success',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'success' => 'boolean',
        ];
    }
}
