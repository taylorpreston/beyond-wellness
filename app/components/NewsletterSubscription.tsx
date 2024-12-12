import {useFetcher} from '@remix-run/react';
import {useState} from 'react';

const NewsletterSubscription = () => {
  const fetcher = useFetcher();
  const [email, setEmail] = useState('');

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const error = fetcher.data?.error;

  return (
    <div className="newsletter-subscription">
      <h3 className="text-lg font-montserrat font-bold mb-4">
        Subscribe to our Newsletter
      </h3>
      <fetcher.Form
        action="/newsletter"
        method="post"
        className="flex flex-col gap-4"
      >
        <div>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded"
            required
            aria-label="Email address"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {isSuccess && (
          <p className="text-green-500 text-sm">Thank you for subscribing!</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn bg-black text-white rounded-none hover:bg-black/80 disabled:opacity-50"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default NewsletterSubscription;
