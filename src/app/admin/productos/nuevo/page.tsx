import { ProductFormProvider } from "@/components/admin/multi-form/formContext";
import ProductForm from "@/components/admin/multi-form/product-form";

export default async function NewProductPage() {
  return (
    <ProductFormProvider>
      <ProductForm />
    </ProductFormProvider>
  );
}
