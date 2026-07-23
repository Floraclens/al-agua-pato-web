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
        priority
        className="w-[clamp(320px,80vw,900px)] max-w-none h-auto opacity-[0.30] select-none"
      />
    </div>
  )
}
