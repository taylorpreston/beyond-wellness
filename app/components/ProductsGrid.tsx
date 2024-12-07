import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';

type ProductNode = NonNullable<
  RecommendedProductsQuery['products']['nodes'][number]
>;

interface ProductsGridProps {
  products: ProductNode[];
  className?: string;
}

export function ProductsGrid({products, className = ''}: ProductsGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-0 border-primary-content text-primary-content bg-[#f7f8f8] border-b ${className}`}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: ProductNode;
  index: number;
}

function ProductCard({product, index}: ProductCardProps) {
  return (
    <Link
      key={product.id}
      className={`flex flex-col bg-base-100 border-primary-content border-t ${
        index === 0 || index % 2 === 0 ? 'border-r' : ''
      }`}
      to={`/products/${product.handle}`}
    >
      <div className="flex flex-col items-start justify-center p-2">
        <h4 className="text-sm font-montserrat font-light">{product.title}</h4>
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
  );
}
