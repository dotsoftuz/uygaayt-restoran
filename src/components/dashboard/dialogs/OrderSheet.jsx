import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, X } from "lucide-react"

export default function OrderSheet({ order, isOpen, onClose }) {
  if (!order) return null

  const getStatusColor = (status) => {
    const colors = {
      "Qabul qilindi": "bg-blue-500",
      "To'y boshlandi": "bg-yellow-500",
      "To'y tugadi": "bg-orange-500",
      "Video editga berildi": "bg-purple-500",
      "Video edit tugadi": "bg-indigo-500",
      "Buyurtma tamomlandi": "bg-green-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl">{order.toyxona}</SheetTitle>
          <Badge className={`${getStatusColor(order.status)} w-fit text-white`}>{order.status}</Badge>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Asosiy ma'lumotlar</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mijoz:</span>
                <span className="font-medium">{order.mijozIsmi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefon:</span>
                <span className="font-medium">{order.telefon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To'yxona:</span>
                <span className="font-medium">{order.toyxona}</span>
              </div>
              {order.nikoh && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nikoh:</span>
                  <span className="font-medium">{order.nikoh}</span>
                </div>
              )}
              {order.bazm && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bazm:</span>
                  <span className="font-medium">{order.bazm}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sana:</span>
                <span className="font-medium">{new Date(order.sana).toLocaleDateString("uz-UZ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kamera soni:</span>
                <span className="font-medium">{order.kameraSoni}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Xizmatlar</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(order.options).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-300" />}
                  <span className={value ? "font-medium" : "text-muted-foreground"}>
                    {key === "nikoh" && "Nikoh"}
                    {key === "fotosessiya" && "Fotosessiya"}
                    {key === "bazm" && "Bazm"}
                    {key === "chimilidq" && "Chimilidq"}
                    {key === "elOshi" && "El oshi"}
                    {key === "fotixaTuy" && "Fotixa tuy"}
                    {key === "kelinSalom" && "Kelin salom"}
                    {key === "qizBazm" && "Qiz bazm"}
                    {key === "loveStory" && "Love Story"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Album & Additional */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Qo'shimcha</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Albom:</span>
                <span className="font-medium">{order.albom}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fleshka:</span>
                {order.fleshka ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-300" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pramoy efir:</span>
                {order.pramoyEfir ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Operators */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Operatorlar</h3>
            <div className="space-y-2 text-sm">
              {order.operatorlar.opr1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator 1:</span>
                  <span className="font-medium">{order.operatorlar.opr1}</span>
                </div>
              )}
              {order.operatorlar.opr2 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operator 2:</span>
                  <span className="font-medium">{order.operatorlar.opr2}</span>
                </div>
              )}
              {order.operatorlar.ronin && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ronin:</span>
                  <span className="font-medium">{order.operatorlar.ronin}</span>
                </div>
              )}
              {order.operatorlar.kran && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kran:</span>
                  <span className="font-medium">{order.operatorlar.kran}</span>
                </div>
              )}
              {order.operatorlar.camera360 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">360 Kamera:</span>
                  <span className="font-medium">{order.operatorlar.camera360}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Additional Fields */}
          {(order.qoshimcha.foto ||
            order.qoshimcha.nahor ||
            order.qoshimcha.kelinSalom ||
            order.qoshimcha.pramoyEfir ||
            order.qoshimcha.montaj) && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Qo'shimcha maydonlar</h3>
                <div className="space-y-2 text-sm">
                  {order.qoshimcha.foto && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Foto:</span>
                      <span className="font-medium">{order.qoshimcha.foto}</span>
                    </div>
                  )}
                  {order.qoshimcha.nahor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nahor:</span>
                      <span className="font-medium">{order.qoshimcha.nahor}</span>
                    </div>
                  )}
                  {order.qoshimcha.kelinSalom && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kelin salom:</span>
                      <span className="font-medium">{order.qoshimcha.kelinSalom}</span>
                    </div>
                  )}
                  {order.qoshimcha.pramoyEfir && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pramoy efir:</span>
                      <span className="font-medium">{order.qoshimcha.pramoyEfir}</span>
                    </div>
                  )}
                  {order.qoshimcha.montaj && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montaj:</span>
                      <span className="font-medium">{order.qoshimcha.montaj}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Price */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Narx</h3>
            <div className="text-2xl font-bold text-primary">{order.narx.toLocaleString("uz-UZ")} so'm</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
