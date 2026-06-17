<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_code',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'birth_date',
        'contact_number',
        'address',
        'email',
        'profile_picture',
        'membership_category',
        'membership_plan_id',
        'membership_status',
        'membership_start_date',
        'membership_end_date',
        'registration_date',
    ];

    protected $appends = ['profile_picture_url', 'full_name', 'membership_price', 'formatted_price'];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date:Y-m-d',
            'membership_start_date' => 'date:Y-m-d',
            'membership_end_date' => 'date:Y-m-d',
            'registration_date' => 'date:Y-m-d',
        ];
    }

    protected function profilePictureUrl(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->profile_picture) {
                return null;
            }

            return Storage::disk('public')->url($this->profile_picture);
        });
    }

    protected function membershipPrice(): Attribute
    {
        return Attribute::get(function () {
            $price = $this->membershipPlan?->price;

            return $price !== null ? (float) $price : null;
        });
    }

    protected function formattedPrice(): Attribute
    {
        return Attribute::get(function () {
            $price = $this->membershipPlan?->price;

            return $price !== null ? '₱'.number_format((float) $price, 2) : null;
        });
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim(collect([$this->first_name, $this->middle_name, $this->last_name])->filter()->implode(' '));
    }
}
