import { supabase } from '@/src/supabase';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
