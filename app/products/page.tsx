import { redirect } from 'next/navigation'

/** Alias /products → /shop (listing page). */
export default function ProductsListingRedirect() {
  redirect('/shop')
}
