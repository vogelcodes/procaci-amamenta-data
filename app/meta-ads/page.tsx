export default async function Ads() {
  const metaAdsToken = process.env.META_ADS_TOKEN;
  let response = await fetch(
    `https://graph.facebook.com/v17.0/act_182895559595801/insights?access_token=${metaAdsToken}&date_preset=last_7d&fields=campaign_name,spend,campaign_id&level=campaign&limit=120&pretty=0&time_increment=1`,
    { next: { revalidate: 3600 } }
  );
  let insights = await response.json();

  let { data } = insights;
  console.log(data);

  while (insights.paging.next) {
    response = await fetch(insights.paging.next);
    insights = await response.json();
    data = data.concat(insights.data);
    console.log(data);
  }
  return <>{JSON.stringify(data, null, 0)}</>;
}
