import { WithChildren } from "helpers/types";
import React from "react";


function getHeadingId(text: string) {
  return text.replace(/ /g, "_").toLowerCase()
}


export function MarkdownLayout({
  children
}: WithChildren) {
  const anchors = React.Children.toArray(children)
    .filter(
      (child: any) =>
        child.props?.mdxType && child.props.mdxType === 'h2'
    )
    .map((child: any) => ({
      id: getHeadingId(child.props.children),
      text: child.props.children,
    }));
    
  return (
    <>
        <ul>
          <li>{anchors.map(anchor => <a href={`#${anchor.id}`}>{anchor.text}</a>)}</li>
        </ul>
        {children}
    </>
  );
}