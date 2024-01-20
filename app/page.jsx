const axios = require("axios");
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";

export function TableDemo(invoices) {
  // console.log(typeof Array(invoices));
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.invoices.map((invoice) => (
          <TableRow key={invoice.product.id}>
            <TableCell className="font-medium">
              {invoice.product.name}
            </TableCell>
            <TableCell>{invoice.buyer.name}</TableCell>
            <TableCell>{invoice.purchase.payment.type}</TableCell>
            <TableCell className="text-right">
              {invoice.purchase.price.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        {/* <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow> */}
      </TableFooter>
    </Table>
  );
}

async function getData() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const data = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
  };

  let access_token; // Declare access_token variable as let, so it can be reassigned
  async function getAccessToken() {
    try {
      const response = await axios.post(
        "https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials",
        data,
        config
      );
      return response.data.access_token;
    } catch (error) {
      console.error(error);
    }
  }

  // Call getAccessToken() once at the beginning of the script and store the resulting access token in a constant

  async function init() {
    access_token = await getAccessToken();
    console.log("Access token:", access_token);
    async function makeApiRequest() {
      // Reuse the access_token in subsequent API requests
      const queryParams = {
        start_date: new Date("2022-02-18T08:30:00.000Z").getTime(),
        end_date: new Date().getTime(),
        max_results: 500,
        transaction_status: "APPROVED",
      };

      const apiConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      };
      let payments;
      try {
        payments = await axios.get(
          `https://developers.hotmart.com/payments/api/v1/sales/history?max_results=${queryParams.max_results}&transaction_status=APPROVED,COMPLETE&start_date=${queryParams.start_date}&end_date=${queryParams.end_date}`,
          apiConfig
        );
      } catch (error) {
        console.error(error);
      }
      return payments.data;
    }
    const apiResponse = makeApiRequest();
    return apiResponse;
  }
  const response = await init();
  return response;
}

export default async function Page() {
  const data = await getData();
  return (
    <>
      <TableDemo invoices={data.items} />
    </>
  );
}
