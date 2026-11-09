<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['pensedekah', 'admin', 'superadmin'] as $name) {
            Role::firstOrCreate(['name' => $name]);
        }

        $email = env('SUPERADMIN_EMAIL');
        $password = env('SUPERADMIN_PASSWORD');

        if (!$email || !$password) {
            return;
        }

        $role = Role::where('name', 'superadmin')->firstOrFail();

        $user = User::firstOrNew(['email' => $email]);

        $user->name = env('SUPERADMIN_NAME', 'Super Admin');
        $user->password = $password;
        $user->role_id = $role->id;
        $user->status = 'active';

        $user->save();
    }
}