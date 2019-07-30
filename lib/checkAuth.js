export default async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }
  ctx.flash.set('You are not authorized');
  ctx.redirect('/');
};
