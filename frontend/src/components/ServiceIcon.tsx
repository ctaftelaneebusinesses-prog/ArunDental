import type { SVGProps } from "react";
import {
  AlignerIcon,
  BracesIcon,
  CrownIcon,
  ExtractionIcon,
  FillingIcon,
  GumCareIcon,
  ImplantIcon,
  LaserIcon,
  MagnifierIcon,
  PediatricIcon,
  RootCanalIcon,
  SparkleCleanIcon,
  ToothIcon,
  WhiteningIcon,
  XrayIcon,
} from "./icons/DentalIcons";
import type { ServiceIconKey } from "../data/services.data";

const ICON_MAP: Record<ServiceIconKey, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  tooth: ToothIcon,
  filling: FillingIcon,
  extraction: ExtractionIcon,
  gum: GumCareIcon,
  braces: BracesIcon,
  aligner: AlignerIcon,
  rootcanal: RootCanalIcon,
  crown: CrownIcon,
  implant: ImplantIcon,
  clean: SparkleCleanIcon,
  whitening: WhiteningIcon,
  pediatric: PediatricIcon,
  laser: LaserIcon,
  xray: XrayIcon,
  magnifier: MagnifierIcon,
};

export function ServiceIcon({ icon, ...props }: { icon: ServiceIconKey } & SVGProps<SVGSVGElement>) {
  const Icon = ICON_MAP[icon];
  return <Icon {...props} />;
}
