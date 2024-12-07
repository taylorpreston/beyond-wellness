import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import logoImage from '~/assets/logo-color.png';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}, {products}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(ALL_PRODUCTS_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
    allProducts: products.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const heroHeightClasses = 'h-auto md:h-[500px]';
  return (
    <div className="overflow-hidden">
      <div className={`${heroHeightClasses} flex flex-col`}>
        <div
          className={`${heroHeightClasses} w-full flex flex-col md:flex-row relative`}
        >
          <div className="absolute inset-0 bg-accent/60" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative flex flex-col md:flex-row w-full h-full">
            <div className="w-full h-full">
              <img
                src={logoImage}
                alt="Beyond Wellness"
                className="w-auto h-full p-8 border-r md:border-r md:border-r-base-100"
              />
            </div>
          </div>
        </div>
      </div>
      <Marquee />
      <RecommendedProducts products={data.recommendedProducts} />
      <ContactForm />
    </div>
  );
}

function ContactForm() {
  return (
    <div className="bg-base-100 border-t border-primary-content">
      <h2 className="text-lg font-montserrat font-bold p-2">Contact Us</h2>
    </div>
  );
}

function Marquee() {
  const marqueeItems = [
    'Ethically Sourced',
    'Woman Owned',
    'Organic',
    'Vegan Friendly',
    'Gluten Free',
  ];
  return (
    <div className="relative flex overflow-x-hidden bg-base-100 py-2">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {marqueeItems.map((item, index) => (
          <span key={index} className="mx-4 text-sm font-montserrat font-light">
            {item}
          </span>
        ))}
      </div>
      <div className="absolute top-0 bottom-0 animate-marquee2 whitespace-nowrap flex items-center">
        {marqueeItems.map((item, index) => (
          <span key={index} className="mx-4 text-sm font-montserrat font-light">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  // const image = collection?.image;
  const image = {
    url: './assets/hero.jpg',
    altText: 'Hero image',
  };
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products bg-base-100 border-t border-primary-content">
      <h2 className="text-lg font-montserrat font-bold p-2">Our Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div
              className="grid grid-cols-2 gap-0 border-primary-content text-primary-content bg-[#f7f8f8] border-b"
              id="recommended-products"
            >
              {response
                ? response.products.nodes.map((product, index) => (
                    <Link
                      key={product.id}
                      className={`flex flex-col bg-base-100 border-primary-content border-t ${index === 0 || index % 2 === 0 ? 'border-r' : ''}`}
                      to={`/products/${product.handle}`}
                    >
                      <div className="flex flex-col items-start justify-center p-2">
                        <h4 className="text-sm font-montserrat font-light">
                          {product.title}
                        </h4>
                      </div>
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                        className="w-full h-full object-cover !rounded-none"
                      />
                      <div className="flex flex-row items-center justify-between p-2">
                        <small>
                          <Money
                            className="text-sm font-montserrat font-light"
                            data={product.priceRange.minVariantPrice}
                          />
                        </small>
                        <button className="link font-montserrat font-bold text-xs">
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  fragment ProductFields on Product {
    id
    title
    handle
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    collections(first: 5) {
      nodes {
        id
        title
        handle
      }
    }
    tags
    vendor
  }

  query AllProducts($country: CountryCode, $language: LanguageCode, $first: Int = 250)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
