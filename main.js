import './style.css';
import { initI18n, getLocalizedString } from './i18n.js';

// TODO: Customer needs to fill this in
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHRoA77MkWjJ5KW-TRNmh4uCZLQOGXsvPqrZiQJya1LsIo1WABML6JD4CxkcqMpvCc/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize i18n
    initI18n();

    const form = document.getElementById('consultationForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation check
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Check if URL is set
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE' || GOOGLE_SCRIPT_URL === '') {
            showToast('Configuration Error: Please set the Google Script URL in main.js', false);
            return;
        }

        setLoading(true);

        try {
            // Collect data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Handle multi-select 'services'specifically (now checkboxes)
            const servicesCheckboxes = document.querySelectorAll('input[name="services"]:checked');
            const selectedServices = Array.from(servicesCheckboxes).map(cb => cb.value);
            data.services = selectedServices.join(', ');

            // Send to Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // With mode: 'no-cors', we get an opaque response. We can't check response.ok.
            // We assume generic success if it didn't throw.
            showToast(getLocalizedString('toast_success'), true);
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showToast('Error occurred, please try again.', false);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = getLocalizedString('btn_submitting');
            btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = getLocalizedString('btn_submit');
            btnLoader.classList.add('hidden');
        }
    }

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastKeywords');

        toastMsg.textContent = message;
        toastIcon.textContent = isSuccess ? '✔' : '⚠';
        toastIcon.style.color = isSuccess ? 'var(--success-color)' : 'var(--error-color)';

        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }
});
