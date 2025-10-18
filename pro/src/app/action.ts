'use server';

import { Resend } from 'resend';

// Initialize Resend with the API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the structure of the form data we expect
interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export async function sendEmail(formData: ContactFormData) {
    // --- DEBUGGING CHECKPOINT 1 ---
    // This will show up in your terminal if the function is being called.
    console.log("---");
    console.log("Server Action 'sendEmail' has been triggered.");

    // --- DEBUGGING CHECKPOINT 2 ---
    // This checks if your API key is loaded.
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
        console.log("✅ Resend API Key is loaded successfully.");
    } else {
        console.error("❌ CRITICAL ERROR: Resend API Key is MISSING or undefined.");
        // If the key is missing, we stop here to prevent a crash.
        return { success: false, error: 'Server configuration error.' };
    }
    
    try {
        // Use the Resend SDK to send the email
        const { data, error } = await resend.emails.send({
            from: 'CloudBillr Contact Form <onboarding@resend.dev>',
            to: ['valogamer352@gmail.com'],
            subject: `New Message from ${formData.name}: ${formData.subject}`,
            replyTo: formData.email,
            html: `
                <h1>New Contact Form Submission</h1>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
                <hr>
                <h2>Message:</h2>
                <p>${formData.message}</p>
            `,
        });

        if (error) {
            // --- DEBUGGING CHECKPOINT 3 ---
            // If Resend returns an error, we will see it here.
            console.error("❌ Resend API returned an error:", error);
            return { success: false, error: 'Failed to send email.' };
        }
        
        // --- DEBUGGING CHECKPOINT 4 ---
        // This confirms the email was sent successfully.
        console.log("✅ Email sent successfully! Resend Response:", data);
        return { success: true, data };

    } catch (error) {
        console.error("❌ An unexpected error occurred in the try-catch block:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

