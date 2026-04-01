import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ProductSubNav = () => {
    const router = useRouter();
    const currentPath = router.pathname;

    const navItems = [
        { name: 'All Products', href: '/admin/products' },
        { name: 'Add New', href: '/admin/products/new' },
        { name: 'Categories', href: '/admin/products/categories' },
        { name: 'Tags', href: '/admin/products/tags' },
        { name: 'Attributes', href: '/admin/products/attributes' },
        { name: 'Brands', href: '/admin/products/brands' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 mb-6 border-b border-[#dcdcde] pb-0">
            {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                            isActive
                                ? 'border-[#2271b1] text-black bg-white -mb-[1px]'
                                : 'border-transparent text-[#2271b1] hover:text-black hover:bg-white/50'
                        }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );
};

export default ProductSubNav;
