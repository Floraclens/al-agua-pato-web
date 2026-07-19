import Image from "next/image"

export function LogoWatermark() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-background pointer-events-none overflow-hidden flex items-center justify-center"
    >
      <Image
        src="/logo-invitacion.png"
        alt=""
        width={992}
        height={533}
        className="w-[160vw] max-w-none md:w-[55vw] h-auto opacity-[0.1] select-none"
      />
    </div>
  )
}
