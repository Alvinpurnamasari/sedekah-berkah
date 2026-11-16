
import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import { Building2, Save, Upload, Mail, Phone, MapPin, Globe } from 'lucide-react';
import '../../../../css/superadmin-settings.css';

export default function SettingsIndex({ settings = {}, flash = {} }) {

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        organization_name: settings.organization_name || 'Sedekah Berkah',
        organization_description: settings.organization_description || '',
        organization_address: settings.organization_address || '',
        organization_email: settings.organization_email || '',
        organization_phone: settings.organization_phone || '',
        organization_website: settings.organization_website || '',
        logo: null,
    });

    const [logoPreview, setLogoPreview] = React.useState(
        settings.organization_logo
            ? `/storage/${settings.organization_logo}`
            : null
    );

    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    function handleLogoChange(event) {
        const file = event.target.files[0];

        if (!file) return;

        setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
    }

    function submit(event) {
        event.preventDefault();
    
        post('/superadmin/pengaturan', {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <SuperadminLayout activeMenu="settings">
            <Head title="Pengaturan Sistem" />

            <div className="ss-page">
                <div className="ss-heading">
                    <div>
                        <span className="ss-eyebrow">KONFIGURASI APLIKASI</span>
                        <h1>Pengaturan Sistem</h1>
                        <p>Kelola identitas dan informasi lembaga Sedekah Berkah.</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="ss-success" role="status">
                        <span>✓</span>
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    <section className="ss-card">
                        <div className="ss-card-heading">
                            <Building2 size={21} />
                            <div>
                                <h2>Identitas Lembaga</h2>
                                <p>Informasi utama yang ditampilkan kepada masyarakat.</p>
                            </div>
                        </div>

                        <div className="ss-logo-section">
                            <div className="ss-logo-preview">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo lembaga" />
                                ) : (
                                    <Building2 size={36} />
                                )}
                            </div>

                            <div>
                                <strong>Logo Lembaga</strong>
                                <p>Format JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
                                <label className="ss-upload-button">
                                    <Upload size={16} />
                                    Pilih Logo
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleLogoChange}
                                        hidden
                                    />
                                </label>
                                {errors.logo && <small className="ss-error">{errors.logo}</small>}
                            </div>
                        </div>

                        <div className="ss-form-grid">
                            <div className="ss-field ss-full">
                                <label>Nama Lembaga *</label>
                                <input
                                    value={data.organization_name}
                                    onChange={e => setData('organization_name', e.target.value)}
                                    placeholder="Nama lembaga"
                                    required
                                />
                                {errors.organization_name && <small className="ss-error">{errors.organization_name}</small>}
                            </div>

                            <div className="ss-field ss-full">
                                <label>Deskripsi Lembaga</label>
                                <textarea
                                    rows="4"
                                    value={data.organization_description}
                                    onChange={e => setData('organization_description', e.target.value)}
                                    placeholder="Jelaskan profil singkat lembaga..."
                                />
                                {errors.organization_description && <small className="ss-error">{errors.organization_description}</small>}
                            </div>

                            <div className="ss-field ss-full">
                                <label><MapPin size={15} /> Alamat</label>
                                <textarea
                                    rows="3"
                                    value={data.organization_address}
                                    onChange={e => setData('organization_address', e.target.value)}
                                    placeholder="Alamat lengkap lembaga"
                                />
                                {errors.organization_address && <small className="ss-error">{errors.organization_address}</small>}
                            </div>

                            <div className="ss-field">
                                <label><Mail size={15} /> Email</label>
                                <input
                                    type="email"
                                    value={data.organization_email}
                                    onChange={e => setData('organization_email', e.target.value)}
                                    placeholder="email@contoh.com"
                                />
                                {errors.organization_email && <small className="ss-error">{errors.organization_email}</small>}
                            </div>

                            <div className="ss-field">
                                <label><Phone size={15} /> Nomor WhatsApp</label>
                                <input
                                    value={data.organization_phone}
                                    onChange={e => setData('organization_phone', e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                />
                                {errors.organization_phone && <small className="ss-error">{errors.organization_phone}</small>}
                            </div>

                            <div className="ss-field ss-full">
                                <label><Globe size={15} /> Website</label>
                                <input
                                    type="url"
                                    value={data.organization_website}
                                    onChange={e => setData('organization_website', e.target.value)}
                                    placeholder="https://contoh.com"
                                />
                                {errors.organization_website && <small className="ss-error">{errors.organization_website}</small>}
                            </div>
                        </div>
                    </section>

                    <div className="ss-actions">
                        <button type="submit" disabled={processing}>
                            <Save size={17} />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </SuperadminLayout>
    );
}
