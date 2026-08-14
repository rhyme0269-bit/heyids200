import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listNavLinks, createNavLink, updateNavLink, deleteNavLink } from "@/lib/cms-db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  return NextResponse.json(listNavLinks());
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.label || !body.href) {
    return NextResponse.json({ error: "label 和 href 為必填" }, { status: 400 });
  }

  const link = createNavLink({
    label: body.label as string,
    href: body.href as string,
    navOrder: body.navOrder as number | undefined,
    isExternal: body.isExternal as boolean | undefined,
  });
  return NextResponse.json(link, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id 為必填" }, { status: 400 });
  }

  const link = updateNavLink(body.id as string, {
    label: body.label as string | undefined,
    href: body.href as string | undefined,
    navOrder: body.navOrder as number | undefined,
    isExternal: body.isExternal as boolean | undefined,
  });
  if (!link) {
    return NextResponse.json({ error: "連結不存在" }, { status: 404 });
  }
  return NextResponse.json(link);
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id 為必填" }, { status: 400 });
  }

  const ok = deleteNavLink(body.id as string);
  if (!ok) {
    return NextResponse.json({ error: "連結不存在" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
