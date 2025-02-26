import React, { useContext } from "react"
import {
  t,
  GridSection,
  GridCell,
  MinimalTable,
  TableThumbnail,
} from "@bloom-housing/ui-components"
import { cloudinaryUrlFromId } from "@bloom-housing/shared-helpers"
import { ListingContext } from "../../ListingContext"

const DetailListingPhoto = () => {
  const listing = useContext(ListingContext)

  let listingFormPhoto = listing.images[0]

  // Set listing photo from assets if necessary:
  // TODO: get rid of assets entirely
  if (listing.images?.length === 0 && listing.assets.length > 0) {
    const asset = listing.assets.find((asset) => asset.label == "building")
    listingFormPhoto = { ordinal: 0, image: { fileId: asset.fileId, label: asset.label } }
  }

  const urlTest = new RegExp(/https?:\/\//)
  const listingPhotoUrl = listingFormPhoto?.image
    ? urlTest.test(listingFormPhoto.image.fileId)
      ? listingFormPhoto.image.fileId
      : cloudinaryUrlFromId(listingFormPhoto.image.fileId)
    : null

  const photoTableHeaders = {
    preview: "t.preview",
    fileName: "t.fileName",
  }
  const photoTableData = [
    {
      preview: (
        <TableThumbnail>
          <img src={listingPhotoUrl} />
        </TableThumbnail>
      ),
      fileName: listingFormPhoto?.image?.fileId.split("/").slice(-1).join(),
    },
  ]

  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("listings.sections.photoTitle")}
      grid={false}
      inset
    >
      <GridSection>
        <GridCell span={2}>
          {listingPhotoUrl ? (
            <MinimalTable
              id="listingPhotoTable"
              headers={photoTableHeaders}
              data={photoTableData}
            />
          ) : (
            <span className={"view-item__value"}>{t("t.none")}</span>
          )}
        </GridCell>
      </GridSection>
    </GridSection>
  )
}

export default DetailListingPhoto
