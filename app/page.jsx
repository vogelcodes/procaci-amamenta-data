const axios = require("axios");
import { cache } from "react";
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

function TableDemo(invoices) {
  // console.log(typeof Array(invoices));
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-[40px]">Data</TableHead>
          <TableHead className="w-[100px]">Produto</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Método de Pagamento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Moeda</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.invoices.map((invoice) => {
          let purchaseDate = new Date(invoice.purchase.order_date);
          let formatedDate = purchaseDate.toLocaleDateString("pt-BR");
          return (
            <TableRow key={invoice.product.id}>
              <TableCell className="font-medium text-ellipsis">
                {formatedDate}
              </TableCell>
              <TableCell className="font-medium text-center">
                {invoice.product.name}
              </TableCell>
              <TableCell>{invoice.buyer.name}</TableCell>
              <TableCell>{invoice.buyer.email}</TableCell>
              <TableCell>{invoice.purchase.payment.type}</TableCell>
              <TableCell className="text-right">
                {invoice.purchase.price.value}
              </TableCell>
              <TableCell className="text-right">
                {invoice.purchase.price.currency_code}
              </TableCell>
            </TableRow>
          );
        })}
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
  var gsResponse = await fetch(
    "https://script.google.com/macros/s/AKfycbwIAj1HWYmqEeF7I_A3WfJGoshnPzSbQLDYir00RhgoWs1QsRj5nLAsEUIAGYuD7DfopQ/exec",
    {
      next: { revalidate: 300 },
    }
  );
  async function convertStreamToObject(response) {
    // Create a new text decoder
    const textDecoder = new TextDecoder("utf-8");

    // Initialize an empty string to store the stream data
    let data = "";

    // Get a readable stream reader
    const streamReader = response.body.getReader();

    // Read the stream until it's done
    while (true) {
      const { done, value } = await streamReader.read();

      // If the stream is done, break out of the loop
      if (done) break;

      // Convert the chunk of data to text and append to the 'data' string
      data += textDecoder.decode(value);
    }

    // Parse the 'data' string into an object (assuming it contains JSON)
    const resultObject = JSON.parse(data);

    return resultObject;
  }

  let leads = await convertStreamToObject(gsResponse);
  leads = leads.sort((a, b) => new Date(b[4]) - new Date(a[4]));
  console.log(leads[1]);
  return (
    <>
      <div>
        <Table>
          <TableCaption>Leads</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[40px]">Nome</TableHead>
              <TableHead className="max-w-[40px]">Email</TableHead>
              <TableHead className="max-w-[40px]">Phone</TableHead>
              <TableHead className="max-w-[40px]">tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.slice(1, 20).map((lead, i) => {
              const url = new URL("https://pv.lactoflow.com.br" + lead[6]);
              const searchParams = url.searchParams;

              // Convert the search parameters to an object
              const paramsObject = {};

              searchParams.forEach((value, key) => {
                paramsObject[key] = value;
              });
              return (
                <TableRow key={lead[0]}>
                  <TableCell>{lead[2]}</TableCell>
                  <TableCell>{lead[0]}</TableCell>
                  <TableCell>{lead[1]}</TableCell>
                  <TableCell>
                    {paramsObject["utm_source"] +
                      "-" +
                      paramsObject["utm_adset"]}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <TableDemo
        invoices={data.items.sort(
          (a, b) => b.purchase.order_date - a.purchase.order_date
        )}
      />
    </>
  );
}
