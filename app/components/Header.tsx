import {Suspense} from 'react';
import {
  Await,
  Link,
  NavLink,
  useAsyncValue,
  useLocation,
} from '@remix-run/react';
import {
  type CartViewPayload,
  Image,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import logoImage from '~/assets/logo-color.png';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  isHomepage: boolean;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  isHomepage = false,
}: HeaderProps) {
  const {shop, menu} = header;

  console.log({
    isHomepage,
  });

  const color = isHomepage ? 'base-100' : 'primary-content';
  const outerGradientClasses = isHomepage ? 'from-accent/60 to-accent/60' : '';
  const innerGradientClasses = isHomepage ? 'from-black/60 to-black/60' : '';
  return (
    <header
      className={`h-64px flex flex-col justify-between items-center text-${color} border-${color} border-b bg-gradient-to-r ${outerGradientClasses}`}
    >
      <div className={`h-full w-full bg-gradient-to-r ${innerGradientClasses}`}>
        <NavLink prefetch="intent" to="/" end>
          {/* <img src={logoImage} alt={shop.name} width={150} height={150} /> */}
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} shop={shop} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {/* {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })} */}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
  shop,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {
  shop: HeaderProps['header']['shop'];
}) {
  const isHomepage = useLocation().pathname === '/';
  return (
    <nav className="navbar flex justify-between items-center" role="navigation">
      <HeaderMenuMobileToggle />
      <Link to="/" className="!no-underline">
        <div className="flex flex-col items-center">
          <h1
            className="text-2xl font-montserrat font-bold font-white mb-0 no-underline"
            style={{lineHeight: '1.2', letterSpacing: '-1px'}}
          >
            Beyond Wellness
          </h1>
          <h1 className="text-xs font-montserrat font-light font-white mt-[-2px] no-underline">
            Herbals Remedies
          </h1>
        </div>
      </Link>
      {/* <img src={logoImage} width={100} height={100} /> */}
      {/* <NavLink prefetch="intent" to="/account">
        <span className="text-xl font-montserrat font-thin font-white">
          <Suspense fallback="Sign in">
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
            </Await>
            </Suspense>
        </span>
      </NavLink> */}
      {/* <SearchToggle /> */}
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3 className="text-lg font-montserrat font-md">Menu</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="text-xl font-montserrat font-thin"
      onClick={() => open('search')}
    >
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="text-lg font-montserrat font"
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
