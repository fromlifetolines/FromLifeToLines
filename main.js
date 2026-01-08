// TODO: Customer needs to fill this in
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYW1N4UZVM1OxWsIqxvxhWryat_BB3AgxX1JLlshoDJ4wW97MKrSme-x4oMzimv6tt/exec';

document.addEventListener('DOMContentLoaded', () => {
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
            // For multi-select, we need to gather values manually
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Handle multi-select 'services' specifically
            const servicesSelect = document.getElementById('services');
            const selectedServices = Array.from(servicesSelect.selectedOptions).map(option => option.value);
            data.services = selectedServices.join(', ');

            // Add Timestamp if desired by client, or let Server do it. Server side is better.

            // Send to Google Apps Script
            // We use no-cors to avoid CORS errors from Google, but this means we can't read the response JSON standardly.
            // However, Google Apps Script usually redirects or returns opaque response.
            // A common workaround is to return JSONP or just assume success if no network error, 
            // OR use a specific setup in GAS to allow CORS (ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON))

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                mode: 'no-cors', // Important for simple GET/POST to GAS without complex CORS headers setup
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // With mode: 'no-cors', we get an opaque response. We can't check response.ok.
            // We assume generic success if it didn't throw.
            showToast('表單已送出 / Form Submitted Successfully!', true);
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showToast('發生錯誤，請稍後再試 / Error occurred, please try again.', false);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = '送出詢問 Submit Request';
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
