import User from "../models/user";
import Stripe from "stripe";
import queryString from "query-string";
import user from "../models/user";

const stripe = Stripe(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req, res) => {
  // 1. find user from db
  const user = await User.findById(req.user._id).exec();
  console.log("USER ==> ", user);
  // 2. if user don't have stripe_account_id yet, create now
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: "express",
    });
    console.log("ACCOUNT ===> ", account);
    user.stripe_account_id = account.id;
    user.save();
  }
  // 3. create login link based on account id (for frontend to complete onboarding)
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });
  // prefill any info such as email
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  // console.log("ACCOUNT LINK", accountLink);
  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  console.log("LOGIN LINK", link);
  res.send(link);
  // 4. update payment schedule (optional. default is 2 days
};

const updateDelayDays = async (accountId) => {
  const account = await stripe.accounts.update(accountId, {
    settings:{
      payouts: {
        schedule: {
          delay_days:7,
        }
      }
    }
  })
  return account;
}

export const getAccountStatus=async(req,res)=> {
  console.log('getAccount status')
  const user = await User.findById(req.user._id).exec();

  const account= await stripe.accounts.retrieve(user.stripe_account_id)
  // console.log("USER Account RETRIEVE",account)
  const updatedAccount = await updateDelayDays(account._id)
  const updatedUser = await User.findByIdAndUpdate(
    user._id,{
      stripe_seller:updatedAccount
    },
    {new:true}
  )
  .select('-password')
  .exec();
  // console.log("Updated User",updatedUser);
    res.json(updatedUser)
}
export const getAccountBalance=async(req, res) => {
  const user= await User.findById(req.user._id).exec();
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    })
    console.log('BALANCE ======>',balance)
    res.json(balance)
  } catch (error) {
    console.log(error)
  }
}

export const payoutSetting = async (req, res)  => {
  try {
    const user = await User.findById(req.user._id).exec()
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
       {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    )
    // console.log('Login link+', loginLink)
    res.json(loginLink)
  } catch (error) {
    console.log('stripe payout settings ERR', error)
  }
}