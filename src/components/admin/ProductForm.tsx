"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Trash,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  crearAtributo,
  crearCategoria,
  getAttributes,
  getCategories,
  guardarProducto,
} from "./actions";

type Variation = {
  id: string;
  attributes: { [key: string]: string };
  stock: number;
};

type OpcionAttribute = {
  valor: string;
};

export default function ProductForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [openCategory, setOpenCategory] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newAttributeDialog, setNewAttributeDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openAttributeSelector, setOpenAttributeSelector] = useState(false);
  const [optionAttribute, setOptionAttribute] = useState("");
  const [selectedOptionAtts, setSelectedOptionAtts] = useState<
    OpcionAttribute[]
  >([]);

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryFn: async () => await getCategories(),
    queryKey: ["categories"],
  });
  const { data: attributes } = useQuery({
    queryFn: async () => await getAttributes(),
    queryKey: ["attributes"],
  });

  const [productInfo, setProductInfo] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
  });

  // New category form
  const [newCategory, setNewCategory] = useState({
    nombre: "",
    descripcion: "",
    img: "",
  });

  // New attribute form
  const [newAttribute, setNewAttribute] = useState<
    Prisma.AtributoVariacionGetPayload<{
      omit: {
        id: true;
      };
      include: {
        OpcionAtributo: {
          omit: {
            id: true;
          };
        };
      };
    }>
  >({
    OpcionAtributo: [],
    nombre: "",
    descripcion: "",
  });

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductInfo({ ...productInfo, image: file.name });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add a new variation
  const addVariation = () => {
    if (selectedAttributes.length === 0) {
      alert(
        "Debes seleccionar al menos un atributo antes de añadir variaciones"
      );
      return;
    }

    const newVariation: Variation = {
      id: Date.now().toString(),
      attributes: selectedAttributes.reduce(
        (acc, attr) => ({ ...acc, [attr]: "" }),
        {}
      ),
      stock: 0,
    };
    setVariations([...variations, newVariation]);
  };

  // Remove a variation
  const removeVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  // Update variation attribute
  const updateVariationAttribute = (
    id: string,
    attribute: string,
    value: string
  ) => {
    setVariations(
      variations.map((v) =>
        v.id === id
          ? { ...v, attributes: { ...v.attributes, [attribute]: value } }
          : v
      )
    );
  };

  // Update variation stock
  const updateVariationStock = (id: string, stock: number) => {
    setVariations(variations.map((v) => (v.id === id ? { ...v, stock } : v)));
  };

  // Add attribute to selected attributes
  const addAttribute = (attributeId: string) => {
    if (!selectedAttributes.includes(attributeId)) {
      setSelectedAttributes([...selectedAttributes, attributeId]);
    }
  };

  // Remove attribute from selected attributes
  const removeAttribute = (attributeId: string) => {
    setSelectedAttributes(
      selectedAttributes.filter((id) => id !== attributeId)
    );

    // Also update variations to remove this attribute
    setVariations(
      variations.map((variation) => {
        const { [attributeId]: _, ...restAttributes } = variation.attributes;
        return {
          ...variation,
          attributes: restAttributes,
        };
      })
    );
  };

  // Create a new category
  const createCategory = async (
    categoria: Prisma.CategoriaGetPayload<{
      omit: {
        id: true;
      };
    }>
  ) => {
    await crearCategoria(categoria);
    // In a real app, this would be an API call

    // Simulate API response
    const newCategoryFromDB = {
      id: Date.now().toString(),
      ...newCategory,
    };

    // Add to categories list

    // Select the new category
    setSelectedCategory(newCategoryFromDB.id);

    // Reset form and close dialog
    setNewCategory({ nombre: "", descripcion: "", img: "" });
    setNewCategoryDialog(false);

    return newCategoryFromDB;
  };

  // Create a new attribute
  const createAttribute = async (
    atributo: Prisma.AtributoVariacionGetPayload<{
      omit: {
        id: true;
      };
      include: {
        OpcionAtributo: {
          omit: {
            id: true;
            atributoId: true;
          };
        };
      };
    }>
  ) => {
    // In a real app, this would be an API call
    const newAtributo = await crearAtributo(atributo);

    addAttribute(newAtributo?.nombre ?? "");

    // Reset form and close dialog
    setNewAttribute({ nombre: "", descripcion: "", OpcionAtributo: [] });
    setNewAttributeDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...productInfo,
      category: selectedCategory,
      attributes: selectedAttributes,
      variations,
    };

    await guardarProducto(data);
  };

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getAttributeName = (attributeId: string) => {
    const attribute = attributes?.find((attr) => attr.id === attributeId);
    return attribute ? attribute.nombre : attributeId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crear Nuevo Producto
          </h1>
          <p className="text-muted-foreground">
            Completa la información para crear un nuevo producto
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                currentStep === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 4 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del producto</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Camiseta Básica Algodón"
                      value={productInfo.name}
                      onChange={(e) =>
                        setProductInfo({ ...productInfo, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio (COP)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Ej: 49900"
                      value={productInfo.price}
                      onChange={(e) =>
                        setProductInfo({
                          ...productInfo,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el producto..."
                      className="min-h-[100px]"
                      value={productInfo.description}
                      onChange={(e) =>
                        setProductInfo({
                          ...productInfo,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">Imagen principal</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed">
                        {imagePreview ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Vista previa"
                              fill
                              className="rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 rounded-full bg-background"
                              onClick={() => {
                                setImagePreview(null);
                                setProductInfo({
                                  ...productInfo,
                                  image: "null",
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Eliminar imagen</span>
                            </Button>
                          </div>
                        ) : (
                          <Label
                            htmlFor="image-upload"
                            className="flex cursor-pointer flex-col items-center justify-center gap-1 text-sm text-muted-foreground"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Subir imagen</span>
                          </Label>
                        )}
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <div className="text-sm text-muted-foreground">
                        <p>Formatos aceptados: .jpg, .jpeg, .png</p>
                        <p>Tamaño máximo: 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={goToNextStep}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoría</Label>
                    <div className="flex gap-2">
                      <Popover
                        open={openCategory}
                        onOpenChange={setOpenCategory}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCategory}
                            className="w-1/2 justify-between"
                          >
                            {selectedCategory
                              ? categories?.find(
                                  (category) => category.id === selectedCategory
                                )?.nombre
                              : "Seleccionar categoría..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar categoría..." />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron categorías.
                              </CommandEmpty>
                              <CommandGroup>
                                {categories?.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={category.id}
                                    onSelect={(currentValue) => {
                                      setSelectedCategory(
                                        currentValue === selectedCategory
                                          ? ""
                                          : currentValue
                                      );
                                      setOpenCategory(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCategory === category.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {category.nombre}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Dialog
                        open={newCategoryDialog}
                        onOpenChange={setNewCategoryDialog}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Crear nueva categoría</DialogTitle>
                            <DialogDescription>
                              Ingresa el nombre de la nueva categoría que deseas
                              crear.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-category-name">
                                Nombre de la categoría
                              </Label>
                              <Input
                                id="new-category-name"
                                placeholder="Ej: Sudaderas"
                                value={newCategory.nombre}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    nombre: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="new-category-description">
                                Descripción
                              </Label>
                              <Textarea
                                id="new-category-description"
                                placeholder="Describe la categoría..."
                                className="min-h-[100px]"
                                value={newCategory.descripcion}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    descripcion: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="new-category-image">
                                URL de imagen
                              </Label>
                              <Input
                                id="new-category-image"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={newCategory.img}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    img: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNewCategoryDialog(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={async () => {
                                await createCategory(newCategory);
                                queryClient.invalidateQueries({
                                  queryKey: ["categories"],
                                });
                              }}
                            >
                              Crear
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Atributos del producto</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Popover
                          open={openAttributeSelector}
                          onOpenChange={setOpenAttributeSelector}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-1/2 justify-between"
                            >
                              Seleccionar atributos
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar atributo..." />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron atributos.
                                </CommandEmpty>
                                <CommandGroup>
                                  {attributes?.map((attribute) => (
                                    <CommandItem
                                      key={attribute.id}
                                      value={attribute.id}
                                      onSelect={(currentValue) => {
                                        if (
                                          selectedAttributes.includes(
                                            currentValue
                                          )
                                        ) {
                                          removeAttribute(currentValue);
                                        } else {
                                          addAttribute(currentValue);
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedAttributes.includes(
                                            attribute.id
                                          )
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {attribute.nombre}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Dialog
                          open={newAttributeDialog}
                          onOpenChange={setNewAttributeDialog}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Crear nuevo atributo</DialogTitle>
                              <DialogDescription>
                                Ingresa el nombre del nuevo atributo que deseas
                                crear.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="new-attribute-name">
                                  Nombre del atributo
                                </Label>
                                <Input
                                  id="new-attribute-name"
                                  placeholder="Ej: Color, Talla, Material"
                                  value={newAttribute.nombre}
                                  onChange={(e) =>
                                    setNewAttribute({
                                      ...newAttribute,
                                      nombre: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Opciones del atributo</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={optionAttribute}
                                    onChange={(e) => {
                                      setOptionAttribute(e.target.value);
                                    }}
                                  />
                                  <Button
                                    onClick={() => {
                                      if (
                                        !selectedOptionAtts.some((obj) =>
                                          Object.values(obj).some((valor) =>
                                            valor.includes(optionAttribute)
                                          )
                                        )
                                      ) {
                                        setSelectedOptionAtts([
                                          ...selectedOptionAtts,
                                          {
                                            valor: optionAttribute,
                                          },
                                        ]);
                                        setOptionAttribute("");
                                      }
                                    }}
                                  >
                                    <Plus />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {selectedOptionAtts.map((option) => (
                                    <div
                                      key={option.valor}
                                      className="flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                                    >
                                      {option.valor}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-1 h-4 w-4 rounded-full"
                                        onClick={() => {
                                          setSelectedOptionAtts(
                                            selectedOptionAtts.filter(
                                              (op) => op !== option
                                            )
                                          );
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">
                                          Eliminar atributo
                                        </span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="new-attribute-description">
                                  Descripción
                                </Label>
                                <Textarea
                                  id="new-attribute-description"
                                  placeholder="Describe el atributo..."
                                  className="min-h-[100px]"
                                  value={newAttribute.descripcion}
                                  onChange={(e) =>
                                    setNewAttribute({
                                      ...newAttribute,
                                      descripcion: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewAttributeDialog(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                onClick={async () => {
                                  await createAttribute({
                                    ...newAttribute,
                                    OpcionAtributo: selectedOptionAtts,
                                  });
                                  queryClient.invalidateQueries({
                                    queryKey: ["attributes"],
                                  });
                                  setSelectedOptionAtts([]);
                                  setOptionAttribute("");
                                }}
                              >
                                Crear
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedAttributes.map((attributeId) => (
                          <div
                            key={attributeId}
                            className="flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                          >
                            {getAttributeName(attributeId)}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 rounded-full"
                              onClick={() => removeAttribute(attributeId)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Eliminar atributo</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                Anterior
              </Button>
              <Button type="button" onClick={goToNextStep}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Variations and Stock */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Variaciones del producto
                    </h3>
                    <Button type="button" onClick={addVariation} size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Añadir variación
                    </Button>
                  </div>

                  {variations.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center">
                      <h4 className="text-sm font-medium">
                        No hay variaciones
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Añade variaciones para gestionar diferentes versiones
                        del producto.
                      </p>
                      <Button
                        type="button"
                        onClick={addVariation}
                        className="mt-4"
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Añadir variación
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variations.map((variation) => (
                        <div
                          key={variation.id}
                          className="rounded-md border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              Variación #{variations.indexOf(variation) + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariation(variation.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">
                                Eliminar variación
                              </span>
                            </Button>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid gap-4 sm:grid-cols-2">
                            {selectedAttributes.map((attributeId) => (
                              <div key={attributeId} className="grid gap-2">
                                <Label
                                  htmlFor={`${variation.id}-${attributeId}`}
                                >
                                  {getAttributeName(attributeId)}
                                </Label>
                                <Input
                                  id={`${variation.id}-${attributeId}`}
                                  placeholder={`Valor para ${getAttributeName(
                                    attributeId
                                  )}`}
                                  value={
                                    variation.attributes[attributeId] || ""
                                  }
                                  onChange={(e) =>
                                    updateVariationAttribute(
                                      variation.id,
                                      attributeId,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                            <div className="grid gap-2">
                              <Label htmlFor={`${variation.id}-stock`}>
                                Stock
                              </Label>
                              <Input
                                id={`${variation.id}-stock`}
                                type="number"
                                min="0"
                                value={variation.stock}
                                onChange={(e) =>
                                  updateVariationStock(
                                    variation.id,
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                Anterior
              </Button>
              <Button type="button" onClick={goToNextStep}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Save */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="basic">
                  <TabsList className="mb-4">
                    <TabsTrigger value="basic">Información básica</TabsTrigger>
                    <TabsTrigger value="variations">Variaciones</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid gap-2">
                      <h3 className="font-medium">Nombre del producto</h3>
                      <p className="text-sm text-muted-foreground">
                        {productInfo.name || "No especificado"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Precio</h3>
                      <p className="text-sm text-muted-foreground">
                        {productInfo.price
                          ? `$${Number.parseInt(
                              productInfo.price
                            ).toLocaleString("es-CO")}`
                          : "No especificado"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Categoría</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory
                          ? categories?.find((c) => c.id === selectedCategory)
                              ?.nombre
                          : "No especificada"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Atributos</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAttributes.map((attributeId) => (
                          <span
                            key={attributeId}
                            className="rounded-full bg-muted px-3 py-1 text-xs"
                          >
                            {getAttributeName(attributeId)}
                          </span>
                        ))}
                        {selectedAttributes.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No se han seleccionado atributos
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Descripción</h3>
                      <p className="text-sm text-muted-foreground">
                        {productInfo.description || "No especificada"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="font-medium">Imagen</h3>
                      {imagePreview ? (
                        <div className="h-32 w-32 overflow-hidden rounded-md border">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Vista previa"
                            width={128}
                            height={128}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No se ha subido ninguna imagen
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="variations">
                    {variations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No se han añadido variaciones
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {variations.map((variation, index) => (
                          <div
                            key={variation.id}
                            className="rounded-md border p-4"
                          >
                            <h3 className="font-medium">
                              Variación #{index + 1}
                            </h3>
                            <div className="mt-2 grid gap-2">
                              {Object.entries(variation.attributes).map(
                                ([attributeId, value]) => (
                                  <div
                                    key={attributeId}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-sm">
                                      {getAttributeName(attributeId)}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {value || "No especificado"}
                                    </span>
                                  </div>
                                )
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Stock</span>
                                <span className="text-sm font-medium">
                                  {variation.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                Anterior
              </Button>
              <Button type="submit" className="bg-primary">
                Guardar producto
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
