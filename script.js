* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #f1f5f9;
}

.hidden {
    display: none !important;
}

/* Modal Overlay & Card */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-card {
    background: #ffffff;
    width: 100%;
    max-width: 400px;
    padding: 24px;
    border-radius: 12px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    background: transparent;
    border: none;
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
}

.close-btn:hover {
    color: #334155;
}

.modal-title {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 20px;
}

/* Tab Switcher */
.auth-tabs {
    display: flex;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 20px;
}

.tab-btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    background: transparent;
    color: #64748b;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn.active {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Form Styling */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.form-group input {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.form-group input:focus {
    border-color: #059669;
}

.submit-btn {
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.green-btn {
    background-color: #047857;
    color: #ffffff;
}

.green-btn:hover {
    background-color: #065f46;
}

/* Đường kẻ ngang "hoặc" */
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 8px 0;
    color: #94a3b8;
    font-size: 12px;
}

.divider::before, .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
}

.divider span {
    padding: 0 10px;
}

/* Nút Google */
.google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.google-btn img {
    width: 18px;
    height: 18px;
}

.google-btn:hover {
    background: #f8fafc;
    border-color: #94a3b8;
}
