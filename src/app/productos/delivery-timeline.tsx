import { CheckCircle, Package, Truck } from "lucide-react";

export default function DeliveryTimeline() {
  return (
    <div className="w-full py-4">
      <h3 className="font-medium mb-4">Entrega rápida garantizada</h3>

      <div className="relative flex justify-between">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full w-full bg-green-500"
            style={{ width: "100%" }}
          ></div>
        </div>

        {/* Timeline steps */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-green-500 text-white rounded-full p-2">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium mt-1">Ordenado</p>
          <p className="text-xs text-muted-foreground">Hoy</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-green-500 text-white rounded-full p-2">
            <Package className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium mt-1">Empacado</p>
          <p className="text-xs text-muted-foreground">Hoy</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-green-500 text-white rounded-full p-2">
            <Truck className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium mt-1">Despachado</p>
          <p className="text-xs text-muted-foreground">Mañana</p>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-green-100 text-green-600 rounded-full p-2">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium mt-1">Entregado</p>
          <p className="text-xs text-muted-foreground">1-2 días</p>
        </div>
      </div>
    </div>
  );
}
