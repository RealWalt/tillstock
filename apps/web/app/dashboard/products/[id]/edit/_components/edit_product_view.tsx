'use client'

import { api } from "@/lib/trpc"
import { ProductFormView } from "../../../_components/product_form_view"

type EditProductViewProps = {
    productId: string
}

export const EditProductView = ({ productId }: EditProductViewProps) => {
    const [product] = api.product.getById.useSuspenseQuery({ id: productId })

    return <ProductFormView mode="edit" product={product} />
}
