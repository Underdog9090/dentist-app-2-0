export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Terms of Service</h1>
      <p className="mb-4">By using Smile Bright Dental Clinic's website, you agree to the following terms:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>Use the site only for lawful purposes.</li>
        <li>Do not attempt to access other users' data.</li>
        <li>Appointments are subject to availability and confirmation.</li>
        <li>We may update these terms at any time.</li>
      </ul>
      <p className="mt-6">For questions, contact us at <a href="mailto:contact@dentistapp.com" className="text-blue-600 underline">contact@dentistapp.com</a>.</p>
    </div>
  );
} 