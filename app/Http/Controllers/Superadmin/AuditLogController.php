<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->select(
                'audit_logs.id',
                'audit_logs.user_id',
                'audit_logs.action',
                'audit_logs.entity_type',
                'audit_logs.entity_id',
                'audit_logs.metadata',
                'audit_logs.ip_address',
                'audit_logs.created_at',
                'users.name as user_name'
            );

        // Pencarian aktivitas atau nama pengguna
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('audit_logs.action', 'like', "%{$search}%")
                    ->orWhere('audit_logs.entity_type', 'like', "%{$search}%")
                    ->orWhere('users.name', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan jenis aktivitas
        if ($request->filled('action')) {
            $query->where('audit_logs.action', $request->action);
        }

        $logs = $query
            ->orderByDesc('audit_logs.created_at')
            ->paginate(15)
            ->withQueryString();

        $actions = DB::table('audit_logs')
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('Superadmin/AuditLogs/Index', [
            'logs' => $logs,
            'actions' => $actions,
            'filters' => [
                'search' => $request->search ?? '',
                'action' => $request->action ?? '',
            ],
        ]);
    }
}
