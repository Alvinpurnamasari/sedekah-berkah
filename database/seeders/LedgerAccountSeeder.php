<?php

namespace Database\Seeders;

use App\Models\LedgerAccount;
use Illuminate\Database\Seeder;

class LedgerAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // ASET
            [
                'code' => '1001',
                'name' => 'Kas',
                'account_type' => 'asset',
                'fund_group' => null,
                'normal_balance' => 'debit',
                'description' => 'Kas yang dimiliki organisasi.',
            ],
            [
                'code' => '1002',
                'name' => 'Rekening Bank',
                'account_type' => 'asset',
                'fund_group' => null,
                'normal_balance' => 'debit',
                'description' => 'Saldo dana pada rekening bank organisasi.',
            ],

            // KEWAJIBAN / DANA BELUM DISALURKAN
            [
                'code' => '2001',
                'name' => 'Dana Donasi Belum Disalurkan',
                'account_type' => 'liability',
                'fund_group' => 'program',
                'normal_balance' => 'credit',
                'description' => 'Dana program yang masih tersedia dan belum disalurkan.',
            ],

            // DANA PROGRAM
            [
                'code' => '3001',
                'name' => 'Dana Program Jumat Berkah',
                'account_type' => 'equity',
                'fund_group' => 'program',
                'normal_balance' => 'credit',
                'description' => 'Dana yang diperuntukkan bagi program Jumat Berkah.',
            ],
            [
                'code' => '3002',
                'name' => 'Dana Program Subuh Berkah',
                'account_type' => 'equity',
                'fund_group' => 'program',
                'normal_balance' => 'credit',
                'description' => 'Dana yang diperuntukkan bagi program Subuh Berkah.',
            ],
            [
                'code' => '3003',
                'name' => 'Dana Program Sedekah Jalanan',
                'account_type' => 'equity',
                'fund_group' => 'program',
                'normal_balance' => 'credit',
                'description' => 'Dana yang diperuntukkan bagi program Sedekah Jalanan.',
            ],

            // DANA OPERASIONAL
            [
                'code' => '3101',
                'name' => 'Dana Operasional',
                'account_type' => 'equity',
                'fund_group' => 'operational',
                'normal_balance' => 'credit',
                'description' => 'Dana dukungan operasional organisasi.',
            ],

            // DANA SPONSOR
            [
                'code' => '3201',
                'name' => 'Dana Sponsor',
                'account_type' => 'equity',
                'fund_group' => 'sponsor',
                'normal_balance' => 'credit',
                'description' => 'Dana yang berasal dari sponsor dan kemitraan.',
            ],

            // PENDAPATAN / PENERIMAAN LAIN
            [
                'code' => '4001',
                'name' => 'Penerimaan Dana Program',
                'account_type' => 'revenue',
                'fund_group' => 'program',
                'normal_balance' => 'credit',
                'description' => 'Penerimaan donasi untuk program.',
            ],
            [
                'code' => '4002',
                'name' => 'Penerimaan Dukungan Operasional',
                'account_type' => 'revenue',
                'fund_group' => 'operational',
                'normal_balance' => 'credit',
                'description' => 'Penerimaan dukungan dana operasional.',
            ],
            [
                'code' => '4003',
                'name' => 'Penerimaan Dana Sponsor',
                'account_type' => 'revenue',
                'fund_group' => 'sponsor',
                'normal_balance' => 'credit',
                'description' => 'Penerimaan dana dari sponsor.',
            ],

            // BEBAN
            [
                'code' => '5001',
                'name' => 'Beban Biaya Payment Gateway',
                'account_type' => 'expense',
                'fund_group' => 'platform',
                'normal_balance' => 'debit',
                'description' => 'Biaya transaksi yang dikenakan payment gateway.',
            ],
            [
                'code' => '5002',
                'name' => 'Beban Operasional',
                'account_type' => 'expense',
                'fund_group' => 'operational',
                'normal_balance' => 'debit',
                'description' => 'Pengeluaran untuk kebutuhan operasional organisasi.',
            ],
            [
                'code' => '5003',
                'name' => 'Beban Penyaluran Dana Program',
                'account_type' => 'expense',
                'fund_group' => 'program',
                'normal_balance' => 'debit',
                'description' => 'Pengeluaran untuk pelaksanaan dan penyaluran program.',
            ],
        ];

        foreach ($accounts as $account) {
            LedgerAccount::updateOrCreate(
                ['code' => $account['code']],
                array_merge($account, ['is_active' => true])
            );
        }
    }
}
