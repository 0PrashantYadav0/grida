import React from "react";
import styled from "@emotion/styled";
import { selector, useRecoilState, useSetRecoilState } from "recoil";
import { currentSelectedIdState, structState } from "state/demo";
import { Struct } from "../../../packages/editor-ui/lib";

const ButtonVariant = ["Frame", "Rect", "Circle", "Text"];

const addSturctObjectUseId = (
  id: string,
  currentStruct: Struct[],
  struct: Struct
) => {
  return currentStruct.map((i) => {
    if (i.id === id) {
      return {
        ...i,
        child: [...i?.child, struct],
      };
    }

    if (i.child) {
      return {
        ...i,
        child: addSturctObjectUseId(id, i.child, struct),
      };
    }

    return i;
  });
};

const structStateSelector = selector({
  key: "structStateSelector",
  get: null,
  set: ({ set, get }, v: string) => {
    const currentStruct = get(structState);
    const currentId = get(currentSelectedIdState);

    let structs = [];
    if (!currentId) {
      structs = [
        ...currentStruct,
        {
          id: v,
          type: "layout",
          title: v,
        },
      ];
    } else {
      structs = addSturctObjectUseId(currentId, currentStruct, {
        id: v,
        type: "layout",
        title: v,
      });

      console.log(structs);
    }

    set(structState, structs);
  },
});

function Header() {
  const setSturct = useSetRecoilState(structStateSelector);

  return (
    <Wrapper>
      {ButtonVariant.map((i) => (
        <button onClick={() => setSturct(i)}>{i}</button>
      ))}
    </Wrapper>
  );
}

export default Header;

const Wrapper = styled.div`
  width: 100%;
  height: 55px;
  background-color: #121212;
  border-bottom: 1px solid #212121;
  display: flex;
`;