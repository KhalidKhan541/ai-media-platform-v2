import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateInput, registerSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateInput(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, password, channelName } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CREATOR',
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      const channel = await tx.channel.create({
        data: {
          name: channelName || `${name}'s Channel`,
          slug: channelName
            ? channelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            : `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(0, 8)}`,
          description: '',
          ownerId: user.id,
        },
        select: { id: true, name: true, slug: true },
      });

      return { user, channel };
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: result.user,
        channel: result.channel,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
