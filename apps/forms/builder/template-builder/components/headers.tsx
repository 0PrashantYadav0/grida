import { GridaLogo } from "@/components/grida-logo";
import { NodeSlot } from "../node";
import { TemplateBuilderWidgets } from "../widgets";

export function Header_001({ logo }: { logo?: string }) {
  return (
    <NodeSlot
      name="Header"
      node_id="header"
      component={TemplateBuilderWidgets.Flex}
      defaultStyle={{
        backgroundColor: "transparent",
        top: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 10,
      }}
    >
      <NodeSlot
        node_id="logo"
        name="Logo"
        component={TemplateBuilderWidgets.Container}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="logo" className="w-full h-5 object-contain" />
      </NodeSlot>
    </NodeSlot>
  );
}
