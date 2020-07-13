import ForgeUI, { render, Fragment, Text, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const { DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['Search the bug online', 'en'],
];

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [bug, getBug] = useState(null);

  async function searchBug() {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { summary, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`http://api.serpstack.com/search?access_key=7817e810f3b9ed1efa8cbf2255ab34e4&page=1&num=2&query=${summary}%20%2B%20stackoverflow`);
    const firstjson = (await response.json()).organic_results[0].url;
    const secondjson = (await response.json()).organic_results[1].url;
    const thirdjson = (await response.json()).organic_results[2].url;
    getBug({
      summary: summary,
      firstlink: firstjson,
      secondlink: secondjson,
      thirdlink: thirdjson
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await searchBug(); }}
          />
        )}
      </ButtonSet>
      {bug && (
        <Fragment>
          <Text content={bug.firstlink} />
          <Text content={bug.secondlink} />
          <Text content={bug.thirdlink} />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
